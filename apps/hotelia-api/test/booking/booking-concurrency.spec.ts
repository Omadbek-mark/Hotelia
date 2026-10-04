import { randomUUID } from 'crypto';
import { createConnection, Connection, Model, Types } from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import HotelSchema from '../../src/schemas/Hotel.model';
import RoomSchema from '../../src/schemas/Room.model';
import BookingSchema from '../../src/schemas/Booking.model';
import MemberSchema from '../../src/schemas/Member.model';
import LikeSchema from '../../src/schemas/Like.model';
import { LikeService } from '../../src/components/like/like.service';
import CommentSchema from '../../src/schemas/Comment.model';
import { CommentService } from '../../src/components/comment/comment.service';
import { CommentGroup, CommentStatus } from '../../src/libs/enums/comment.enum';
import FollowSchema from '../../src/schemas/Follow.model';
import { FollowService } from '../../src/components/follow/follow.service';
import BoardArticleSchema from '../../src/schemas/BoardArticle.model';
import { BoardArticleService } from '../../src/components/board-article/board-article.service';
import { BoardArticleCategory, BoardArticleStatus } from '../../src/libs/enums/board-article.enum';
import { HotelService } from '../../src/components/hotel/hotel.service';
import { RoomService } from '../../src/components/room/room.service';
import { BookingService } from '../../src/components/booking/booking.service';
import { MemberService } from '../../src/components/member/member.service';
import { RoomSort } from '../../src/libs/enums/room.enum';
import { MemberType } from '../../src/libs/enums/member.enum';
import { BookingStatus } from '../../src/libs/enums/booking.enum';
import { getStayDates } from '../../src/libs/booking/stay-dates';

// Opt-in: starts an isolated real MongoDB replica set; never reads the application .env.
const integration = process.env.RUN_MONGO_INTEGRATION === '1' ? describe : describe.skip;
integration('Booking transactions against real MongoDB', () => {
	let repl: MongoMemoryReplSet;
	let connection: Connection;
	let hotels: Model<any>, rooms: Model<any>, bookings: Model<any>, members: Model<any>;
	let likes: Model<any>, likeService: LikeService;
	let comments: Model<any>, commentService: CommentService;
	let follows: Model<any>, followService: FollowService;
	let articles: Model<any>, articleService: BoardArticleService;
	let hotelService: HotelService, roomService: RoomService, bookingService: BookingService;
	let hotelId: Types.ObjectId, roomId: Types.ObjectId, ownerId: Types.ObjectId;
	const guestId = new Types.ObjectId();
	beforeAll(async () => {
		repl = await MongoMemoryReplSet.create({
			binary: { downloadDir: '/tmp/hotelia-mongodb-binaries' },
			replSet: { count: 1 },
		});
		connection = await createConnection(repl.getUri(), { dbName: 'hotelia_booking_test' }).asPromise();
		hotels = connection.model('Hotel', HotelSchema);
		rooms = connection.model('Room', RoomSchema);
		bookings = connection.model('Booking', BookingSchema);
		members = connection.model('Member', MemberSchema);
		likes = connection.model('Like', LikeSchema);
		comments = connection.model('Comment', CommentSchema);
		follows = connection.model('Follow', FollowSchema);
		articles = connection.model('BoardArticle', BoardArticleSchema);
		await follows.init();
		await comments.init();
		await Promise.all([hotels.init(), rooms.init(), bookings.init(), members.init(), likes.init()]);
		likeService = new LikeService(likes, hotels, connection);
		const memberService = new MemberService(members, {} as any, {} as any, {} as any, {} as any);
		articleService = new BoardArticleService(articles, memberService, {} as any, likeService, connection);
		followService = new FollowService(follows, memberService, members, connection);
		commentService = new CommentService(comments, memberService, {} as any, {} as any, bookings, hotels, connection);
		hotelService = new HotelService(connection, memberService, {} as any, hotels, bookings);
		roomService = new RoomService(rooms, hotelService, connection, bookings);
		bookingService = new BookingService(bookings, rooms, connection, hotelService);
	}, 180000);
	afterAll(async () => {
		await connection?.close();
		await repl?.stop();
	});
	beforeEach(async () => {
		await articles.deleteMany({});
		await follows.deleteMany({});
		await comments.deleteMany({});
		await Promise.all([
			bookings.deleteMany({}),
			rooms.deleteMany({}),
			hotels.deleteMany({}),
			members.deleteMany({}),
			likes.deleteMany({}),
		]);
		const owner = await members.create({
			memberNick: 'owner',
			memberEmail: 'owner@test.invalid',
			memberPassword: 'test-hash',
			memberType: 'HOTEL_OWNER',
			memberHotels: 1,
		});
		ownerId = owner._id;
		const hotel = await hotels.create({
			ownerId,
			hotelName: 'Test Hotel',
			hotelDescription: 'Hotel for integration testing',
			hotelCountry: 'Korea',
			hotelCity: 'Seoul',
			hotelAddress: 'Test street 1',
			hotelTimezone: 'Asia/Seoul',
			hotelType: 'HOTEL',
			hotelImages: ['hotel.jpg'],
			hotelAmenities: [],
		});
		hotelId = hotel._id;
		const room = await rooms.create({
			hotelId,
			roomName: 'Deluxe Room',
			roomDescription: 'Room for integration testing',
			roomType: 'DELUXE',
			roomPrice: 19.99,
			roomCapacity: 2,
			roomQuantity: 2,
			bedType: 'QUEEN',
			roomSize: 30,
			roomImages: ['room.jpg'],
			roomAmenities: [],
		});
		roomId = room._id;
	});
	const input = (change: Record<string, unknown> = {}) => ({
		roomId: String(roomId),
		checkIn: '2035-09-10',
		checkOut: '2035-09-13',
		guests: 2,
		rooms: 1,
		requestId: randomUUID(),
		...change,
	});
	const articleInput = {
		articleCategory: BoardArticleCategory.TRAVEL_TIPS,
		articleTitle: '[Seoul] guide',
		articleContent: 'Useful travel advice',
	};
	it('keeps article counts consistent and prevents editing another authors article or deleting twice', async () => {
		const article = await articleService.createBoardArticle(ownerId as any, articleInput);
		expect((await members.findById(ownerId))!.memberArticles).toBe(1);
		await expect(
			articleService.updateBoardArticle(guestId as any, { _id: article._id, articleTitle: 'Changed title' }),
		).rejects.toMatchObject({ status: 404 });
		await articleService.updateBoardArticleByAdmin({ _id: article._id, articleStatus: BoardArticleStatus.DELETE });
		await expect(
			articleService.updateBoardArticleByAdmin({ _id: article._id, articleStatus: BoardArticleStatus.DELETE }),
		).rejects.toMatchObject({ status: 404 });
		expect((await members.findById(ownerId))!.memberArticles).toBe(0);
	});
	it('rolls back article creation when its member counter cannot be updated', async () => {
		await expect(articleService.createBoardArticle(new Types.ObjectId() as any, articleInput)).rejects.toBeDefined();
		expect(await articles.countDocuments()).toBe(0);
	});
	it('searches literal article text and returns public author data without losing missing-author articles', async () => {
		const article = await articleService.createBoardArticle(ownerId as any, articleInput);
		await articleService.createBoardArticle(ownerId as any, { ...articleInput, articleTitle: 'Seoul hotels' });
		const result = await articleService.getBoardArticles(null as any, {
			page: 1,
			limit: 10,
			search: { text: '[Seoul]' },
		});
		expect(result.metaCounter).toEqual([{ total: 1 }]);
		expect(Object.keys(result.list[0].memberData!).sort()).toEqual(['_id', 'memberImage', 'memberNick']);
		const detail = await articleService.getBoardArticle(null as any, article._id);
		expect(detail.memberData!.memberNick).toBe('owner');
		await members.deleteOne({ _id: ownerId });
		expect((await articleService.getBoardArticle(null as any, article._id)).memberData).toBeUndefined();
		expect(
			(await articleService.getBoardArticles(null as any, { page: 1, limit: 10, search: {} })).metaCounter,
		).toEqual([{ total: 2 }]);
	});
	const followGuest = () =>
		members.create({ _id: guestId, memberNick: 'guest', memberEmail: 'guest@test.invalid', memberPassword: 'private' });
	it('keeps follow counters correct under duplicate requests and allows leaving a blocked target', async () => {
		await followGuest();
		await expect(followService.subscribe(guestId as any, guestId as any)).rejects.toMatchObject({ status: 400 });
		const results = await Promise.allSettled([
			followService.subscribe(guestId as any, ownerId as any),
			followService.subscribe(guestId as any, ownerId as any),
		]);
		expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
		expect(await follows.countDocuments()).toBe(1);
		expect((await members.findById(guestId))!.memberFollowings).toBe(1);
		expect((await members.findById(ownerId))!.memberFollowers).toBe(1);
		await members.updateOne({ _id: ownerId }, { $set: { memberStatus: 'BLOCK' } });
		await followService.unsubscribe(guestId as any, ownerId as any);
		await expect(followService.unsubscribe(guestId as any, ownerId as any)).rejects.toMatchObject({ status: 404 });
		await expect(followService.subscribe(guestId as any, ownerId as any)).rejects.toMatchObject({ status: 404 });
		expect((await members.findById(guestId))!.memberFollowings).toBe(0);
		expect((await members.findById(ownerId))!.memberFollowers).toBe(0);
	}, 30000);
	it('rolls back follow creation when a member counter cannot be updated', async () => {
		await expect(followService.subscribe(new Types.ObjectId() as any, ownerId as any)).rejects.toBeDefined();
		expect(await follows.countDocuments()).toBe(0);
		expect((await members.findById(ownerId))!.memberFollowers).toBe(0);
	});
	it('counts visible follow profiles before pagination and never returns private member fields', async () => {
		await followGuest();
		const hidden = await members.create({
			memberNick: 'hidden',
			memberEmail: 'hidden@test.invalid',
			memberPassword: 'private',
		});
		await followService.subscribe(guestId as any, ownerId as any);
		await followService.subscribe(guestId as any, hidden._id);
		await members.updateOne({ _id: hidden._id }, { $set: { memberStatus: 'DELETE' } });
		const list = await followService.getMemberFollowings(guestId as any, {
			page: 1,
			limit: 1,
			search: { followerId: guestId as any },
		});
		expect(list.metaCounter).toEqual([{ total: 1 }]);
		expect(list.list).toHaveLength(1);
		expect(Object.keys(list.list[0].followingData!).sort()).toEqual(['_id', 'memberImage', 'memberNick']);
		expect(list.list[0].meFollowed![0].myFollowing).toBe(true);
		const followers = await followService.getMemberFollowers(null as any, {
			page: 1,
			limit: 10,
			search: { followingId: ownerId as any },
		});
		expect(followers.metaCounter).toEqual([{ total: 1 }]);
		expect(followers.list[0].followerData!.memberNick).toBe('guest');
		expect(followers.list[0].meFollowed).toEqual([]);
	});
	it('saves a hotel only once under parallel retries and removes only the requesting member favorite', async () => {
		await Promise.all([
			likeService.setHotelFavorite(guestId, hotelId, true),
			likeService.setHotelFavorite(guestId, hotelId, true),
		]);
		expect(await likes.countDocuments()).toBe(1);
		expect((await hotels.findById(hotelId))!.hotelLikes).toBe(1);
		const first = await likes.findOne();
		expect(first.createdAt).toBeInstanceOf(Date);
		await likeService.setHotelFavorite(guestId, hotelId, true);
		expect((await likes.findOne())!.createdAt).toEqual(first.createdAt);
		await likeService.setHotelFavorite(ownerId, hotelId, true);
		await Promise.all([
			likeService.setHotelFavorite(guestId, hotelId, false),
			likeService.setHotelFavorite(guestId, hotelId, false),
		]);
		expect(await likes.countDocuments()).toBe(1);
		expect((await hotels.findById(hotelId))!.hotelLikes).toBe(1);
		expect((await likes.findOne())!.memberId.equals(ownerId)).toBe(true);
	}, 30000);
	it('keeps favorite counters consistent when save and remove race and rolls back failed writes', async () => {
		await Promise.allSettled([
			likeService.setHotelFavorite(guestId, hotelId, true),
			likeService.setHotelFavorite(guestId, hotelId, false),
		]);
		expect((await hotels.findById(hotelId))!.hotelLikes).toBe(await likes.countDocuments());
		const failure = jest.spyOn(hotels, 'findOneAndUpdate').mockImplementationOnce(() => {
			throw new Error('counter write failed');
		});
		try {
			await expect(likeService.setHotelFavorite(ownerId, hotelId, true)).rejects.toThrow('counter write failed');
		} finally {
			failure.mockRestore();
		}
		expect(await likes.countDocuments({ memberId: ownerId })).toBe(0);
		expect((await hotels.findById(hotelId))!.hotelLikes).toBe(await likes.countDocuments());
	});
	it('filters favorites before counting, scopes members, and supplies personal flags', async () => {
		await likeService.setHotelFavorite(guestId, hotelId, true);
		const hidden = await hotels.create({
			...(await hotels.findById(hotelId))!.toObject(),
			_id: new Types.ObjectId(),
			hotelLikes: 0,
		});
		await likeService.setHotelFavorite(guestId, hidden._id, true);
		await hotels.updateOne({ _id: hidden._id }, { $set: { hotelStatus: 'PAUSED' } });
		await likes.create({ memberId: guestId, likeRefId: new Types.ObjectId(), likeGroup: 'ARTICLE' });
		const result = await likeService.getFavoriteHotels(guestId, { page: 1, limit: 1 });
		expect(result.metaCounter).toEqual([{ total: 1 }]);
		expect(result.list[0].isFavorite).toBe(true);
		expect(result.list[0].memberData!.memberNick).toBe('owner');
		expect((result.list[0].memberData as any).memberPassword).toBeUndefined();
		expect(await likeService.getFavoriteHotels(ownerId, { page: 1, limit: 20 })).toEqual({ list: [], metaCounter: [] });
		const list = [await hotels.findById(hotelId).lean()];
		await likeService.attachFavoriteStatus(list, guestId);
		expect(list[0].isFavorite).toBe(true);
		await likeService.attachFavoriteStatus(list, ownerId);
		expect(list[0].isFavorite).toBe(false);
		await likeService.attachFavoriteStatus(list);
		expect(list[0].isFavorite).toBe(false);
		await expect(likeService.setHotelFavorite(guestId, hidden._id, true)).rejects.toMatchObject({ status: 404 });
		await hotels.updateOne({ _id: hidden._id }, { $set: { hotelStatus: 'DELETE' } });
		expect((await likeService.setHotelFavorite(guestId, hidden._id, false)).hotelLikes).toBe(0);
	});
	const available = (change: Record<string, unknown> = {}) =>
		roomService.getAvailableRooms({
			hotelId: String(hotelId),
			checkIn: '2035-09-10',
			checkOut: '2035-09-15',
			guests: 1,
			rooms: 1,
			page: 1,
			limit: 20,
			sort: RoomSort.NEWEST,
			...change,
		});
	const seed = (start: string, end: string, quantity: number, extra = {}) =>
		bookings.create({
			memberId: guestId,
			hotelId,
			roomId,
			...getStayDates(start, end),
			guests: 1,
			rooms: quantity,
			pricePerNight: 1,
			totalPrice: 1,
			bookingStatus: 'CONFIRMED',
			...extra,
		});
	const reviewInput = (bookingId: unknown, rating = 5) => ({
		commentGroup: CommentGroup.HOTEL,
		commentRefId: hotelId as any,
		bookingId: String(bookingId),
		rating,
		commentContent: 'Enjoyed my stay',
	});
	it('computes the owner dashboard with physical quantities and completed USD booking values only', async () => {
		const originalHotel = (await hotels.findById(hotelId))!.toObject();
		const originalRoom = (await rooms.findById(roomId))!.toObject();
		const paused = await hotels.create({ ...originalHotel, _id: new Types.ObjectId(), hotelStatus: 'PAUSED' });
		await rooms.create({
			...originalRoom,
			_id: new Types.ObjectId(),
			hotelId: paused._id,
			roomStatus: 'PAUSED',
			roomQuantity: 3,
		});
		await rooms.create({ ...originalRoom, _id: new Types.ObjectId(), roomStatus: 'DELETE', roomQuantity: 7 });
		const deleted = await hotels.create({ ...originalHotel, _id: new Types.ObjectId(), hotelStatus: 'DELETE' });
		await rooms.create({ ...originalRoom, _id: new Types.ObjectId(), hotelId: deleted._id, roomQuantity: 10 });
		const foreign = await hotels.create({ ...originalHotel, _id: new Types.ObjectId(), ownerId: new Types.ObjectId() });
		for (const [bookingStatus, totalPrice] of [
			['COMPLETED', 19.99],
			['COMPLETED', 0.01],
			['CONFIRMED', 88],
			['PENDING', 22],
			['CANCELLED', 44],
		]) {
			await seed('2020-01-01', '2020-01-03', 1, { bookingStatus, totalPrice });
		}
		await seed('2020-01-01', '2020-01-03', 1, { hotelId: deleted._id, bookingStatus: 'COMPLETED', totalPrice: 10 });
		await seed('2020-01-01', '2020-01-03', 1, { hotelId: foreign._id, bookingStatus: 'COMPLETED', totalPrice: 999 });
		expect(await bookingService.getOwnerDashboard(ownerId)).toEqual({
			totalHotels: 2,
			totalRooms: 5,
			totalBookings: 6,
			totalRevenue: 30,
			currency: 'USD',
		});
		expect(await bookingService.getOwnerDashboard(new Types.ObjectId())).toEqual({
			totalHotels: 0,
			totalRooms: 0,
			totalBookings: 0,
			totalRevenue: 0,
			currency: 'USD',
		});
	});
	it('requires the members own completed booking for the matching hotel', async () => {
		const booking = await seed('2020-01-01', '2020-01-03', 1);
		await expect(commentService.createComment(guestId as any, reviewInput(booking._id))).rejects.toMatchObject({
			status: 404,
		});
		await bookingService.completeBooking(ownerId, booking._id);
		await expect(commentService.createComment(ownerId as any, reviewInput(booking._id))).rejects.toMatchObject({
			status: 404,
		});
		await expect(
			commentService.createComment(guestId as any, {
				...reviewInput(booking._id),
				commentRefId: new Types.ObjectId() as any,
			}),
		).rejects.toMatchObject({ status: 404 });
		expect(await comments.countDocuments()).toBe(0);
	});
	it('prevents duplicate reviews and keeps rating correct across parallel create, update and delete', async () => {
		const a = await seed('2020-01-01', '2020-01-03', 1, { bookingStatus: 'COMPLETED' });
		const b = await seed('2020-02-01', '2020-02-03', 1, { bookingStatus: 'COMPLETED' });
		const duplicate = await Promise.allSettled([
			commentService.createComment(guestId as any, reviewInput(a._id, 5)),
			commentService.createComment(guestId as any, reviewInput(a._id, 5)),
		]);
		expect(duplicate.filter((item) => item.status === 'fulfilled')).toHaveLength(1);
		const review = await comments.findOne({ bookingId: a._id });
		await Promise.all([
			commentService.updateComment(guestId as any, { _id: review._id, rating: 3 }),
			commentService.createComment(guestId as any, reviewInput(b._id, 1)),
		]);
		expect((await hotels.findById(hotelId))!.toObject()).toMatchObject({ hotelReviews: 2, hotelRating: 2 });
		await expect(commentService.updateComment(ownerId as any, { _id: review._id, rating: 5 })).rejects.toMatchObject({
			status: 404,
		});
		await commentService.updateComment(guestId as any, { _id: review._id, commentStatus: CommentStatus.DELETE });
		expect((await hotels.findById(hotelId))!.toObject()).toMatchObject({ hotelReviews: 1, hotelRating: 1 });
		await expect(commentService.createComment(guestId as any, reviewInput(a._id))).rejects.toMatchObject({
			status: 409,
		});
		const remaining = await comments.findOne({ bookingId: b._id });
		await commentService.removeCommentByAdmin(remaining._id);
		expect((await hotels.findById(hotelId))!.toObject()).toMatchObject({ hotelReviews: 0, hotelRating: 0 });
	}, 30000);
	it('projects public review authors and keeps pagination totals when an author is missing', async () => {
		const a = await seed('2020-01-01', '2020-01-03', 1, { bookingStatus: 'COMPLETED' });
		await commentService.createComment(guestId as any, reviewInput(a._id));
		const inquiry = { page: 1, limit: 10, search: { commentRefId: hotelId as any, commentGroup: CommentGroup.HOTEL } };
		const result = await commentService.getComments(null as any, inquiry);
		expect(result.metaCounter).toEqual([{ total: 1 }]);
		expect(result.list).toHaveLength(1);
		await members.create({
			_id: guestId,
			memberNick: 'reviewer',
			memberEmail: 'review@test.invalid',
			memberPassword: 'hidden',
		});
		const populated = await commentService.getComments(null as any, inquiry);
		expect(Object.keys(populated.list[0].memberData!).sort()).toEqual(['_id', 'memberImage', 'memberNick']);
		await hotels.updateOne({ _id: hotelId }, { $set: { hotelStatus: 'PAUSED' } });
		await expect(commentService.getComments(null as any, inquiry)).rejects.toMatchObject({ status: 404 });
	});

	it('calculates immutable USD snapshots and a 15-minute pending hold', async () => {
		const before = Date.now();
		const booking = await bookingService.createBooking(guestId, input({ rooms: 2, guests: 4 }));
		expect(booking.currency).toBe('USD');
		expect(booking.nights).toBe(3);
		expect(booking.totalPrice).toBe(119.94);
		expect(booking.expiresAt!.getTime()).toBeGreaterThanOrEqual(before + 15 * 60 * 1000);
		expect((await available()).list).toHaveLength(0);
		await roomService.updateRoom(ownerId, { _id: String(roomId), roomPrice: 25 });
		expect((await bookings.findById(booking._id))!.totalPrice).toBe(119.94);
	});
	it('allows only one concurrent reservation for the final room', async () => {
		await rooms.updateOne({ _id: roomId }, { $set: { roomQuantity: 1 } });
		const results = await Promise.allSettled([
			bookingService.createBooking(guestId, input()),
			bookingService.createBooking(new Types.ObjectId(), input()),
		]);
		expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
		const rejected = results.find((result) => result.status === 'rejected') as PromiseRejectedResult;
		expect(rejected.reason.getStatus()).toBe(409);
		expect(await bookings.countDocuments()).toBe(1);
	}, 30000);
	it('deduplicates parallel retries with the same requestId', async () => {
		const request = input();
		const [a, b] = await Promise.all([
			bookingService.createBooking(guestId, request),
			bookingService.createBooking(guestId, request),
		]);
		expect(String(a._id)).toBe(String(b._id));
		expect(await bookings.countDocuments()).toBe(1);
		await expect(bookingService.createBooking(guestId, { ...request, rooms: 2 })).rejects.toMatchObject({
			status: 409,
		});
	}, 30000);
	it('rolls back lock writes when inventory is insufficient', async () => {
		await expect(bookingService.createBooking(guestId, input({ rooms: 3 }))).rejects.toMatchObject({ status: 409 });
		expect(await bookings.countDocuments()).toBe(0);
		expect((await hotels.findById(hotelId).select('+bookingVersion'))!.bookingVersion).toBe(0);
		expect((await rooms.findById(roomId).select('+bookingVersion'))!.bookingVersion).toBe(0);
	});
	it('rolls back lock writes when booking persistence fails', async () => {
		const failure = jest.spyOn(bookings, 'create').mockRejectedValueOnce(new Error('insert failed'));
		try {
			await expect(bookingService.createBooking(guestId, input())).rejects.toThrow('insert failed');
		} finally {
			failure.mockRestore();
		}
		expect(await bookings.countDocuments()).toBe(0);
		expect((await hotels.findById(hotelId).select('+bookingVersion'))!.bookingVersion).toBe(0);
	});
	it('counts consecutive bookings per night instead of summing them', async () => {
		await seed('2035-09-10', '2035-09-12', 1);
		await seed('2035-09-12', '2035-09-15', 1);
		expect((await available()).list[0].availableQuantity).toBe(1);
		const booking = await bookingService.createBooking(guestId, input({ checkOut: '2035-09-15' }));
		expect(booking.nights).toBe(5);
	});
	it('finds peak occupancy with partial overlaps and respects adjacent checkout', async () => {
		await seed('2035-09-09', '2035-09-12', 1);
		await seed('2035-09-11', '2035-09-13', 1);
		expect((await available()).list).toHaveLength(0);
		expect((await available({ checkIn: '2035-09-13', checkOut: '2035-09-15' })).list[0].availableQuantity).toBe(2);
	});
	it('ignores expired pending, cancelled and completed bookings, but counts unexpired pending', async () => {
		await seed('2035-09-10', '2035-09-15', 2, { bookingStatus: 'PENDING', expiresAt: new Date(Date.now() - 1000) });
		await seed('2035-09-10', '2035-09-15', 2, { bookingStatus: 'CANCELLED' });
		await seed('2035-09-10', '2035-09-15', 2, { bookingStatus: 'COMPLETED' });
		expect((await available()).list[0].availableQuantity).toBe(2);
		await seed('2035-09-10', '2035-09-15', 1, { bookingStatus: 'PENDING', expiresAt: new Date(Date.now() + 60000) });
		expect((await available()).list[0].availableQuantity).toBe(1);
	});
	it('prevents destructive changes while a booking consumes inventory', async () => {
		await bookingService.createBooking(guestId, input());
		await expect(roomService.updateRoom(ownerId, { _id: String(roomId), roomQuantity: 1 })).rejects.toMatchObject({
			status: 409,
		});
		await expect(roomService.updateRoom(ownerId, { _id: String(roomId), roomCapacity: 1 })).rejects.toMatchObject({
			status: 409,
		});
		await expect(roomService.deleteRoom(ownerId, roomId)).rejects.toMatchObject({ status: 409 });
		await expect(hotelService.deleteHotel(ownerId, hotelId)).rejects.toMatchObject({ status: 409 });
		expect((await hotels.findById(hotelId))!.hotelStatus).toBe('ACTIVE');
		expect((await members.findById(ownerId))!.memberHotels).toBe(1);
	});
	it('keeps inventory consistent when reduction races with a booking', async () => {
		await Promise.allSettled([
			bookingService.createBooking(guestId, input({ rooms: 2, guests: 4 })),
			roomService.updateRoom(ownerId, { _id: String(roomId), roomQuantity: 1 }),
		]);
		const quantity = (await rooms.findById(roomId))!.roomQuantity;
		const occupied = (await bookings.find()).reduce((sum, booking) => sum + booking.rooms, 0);
		expect(occupied).toBeLessThanOrEqual(quantity);
	}, 30000);
	it('serializes deletion with a simultaneous booking', async () => {
		await Promise.allSettled([bookingService.createBooking(guestId, input()), roomService.deleteRoom(ownerId, roomId)]);
		const room = await rooms.findById(roomId);
		expect(room!.roomStatus === 'DELETE' && (await bookings.countDocuments()) > 0).toBe(false);
	}, 30000);
	it('serializes hotel deletion with a simultaneous booking', async () => {
		await Promise.allSettled([
			bookingService.createBooking(guestId, input()),
			hotelService.deleteHotel(ownerId, hotelId),
		]);
		const hotel = await hotels.findById(hotelId);
		const count = await bookings.countDocuments();
		expect(hotel!.hotelStatus === 'DELETE' && count > 0).toBe(false);
		expect((await members.findById(ownerId))!.memberHotels).toBe(hotel!.hotelStatus === 'DELETE' ? 0 : 1);
	}, 30000);
	it('allows deletion after a pending hold expires without deleting booking history', async () => {
		const booking = await bookingService.createBooking(guestId, input());
		await bookings.updateOne({ _id: booking._id }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
		await roomService.deleteRoom(ownerId, roomId);
		await hotelService.deleteHotel(ownerId, hotelId);
		expect(await bookings.countDocuments()).toBe(1);
		expect((await members.findById(ownerId))!.memberHotels).toBe(0);
	});
	it('rejects booking an inactive hotel or a room without enough capacity', async () => {
		await expect(bookingService.createBooking(guestId, input({ guests: 3 }))).rejects.toMatchObject({ status: 409 });
		await hotels.updateOne({ _id: hotelId }, { $set: { hotelStatus: 'PAUSED' } });
		await expect(bookingService.createBooking(guestId, input())).rejects.toMatchObject({ status: 404 });
	});
	it('confirms a held booking at a paused hotel without changing its price', async () => {
		const booking = await bookingService.createBooking(guestId, input());
		await hotels.updateOne({ _id: hotelId }, { $set: { hotelStatus: 'PAUSED' } });
		const confirmed = await bookingService.confirmBooking(ownerId, booking._id);
		expect(confirmed.bookingStatus).toBe('CONFIRMED');
		expect(confirmed.expiresAt).toBeUndefined();
		expect(confirmed.totalPrice).toBe(59.97);
		await expect(bookingService.confirmBooking(ownerId, booking._id)).rejects.toMatchObject({ status: 409 });
	});
	it('rejects another owner and never revives an expired hold after inventory is rebooked', async () => {
		const booking = await bookingService.createBooking(guestId, input({ rooms: 2, guests: 4 }));
		await expect(bookingService.confirmBooking(new Types.ObjectId(), booking._id)).rejects.toMatchObject({
			status: 404,
		});
		await bookings.updateOne({ _id: booking._id }, { $set: { expiresAt: new Date(Date.now() - 1) } });
		await bookingService.createBooking(new Types.ObjectId(), input({ rooms: 2, guests: 4 }));
		await expect(bookingService.confirmBooking(ownerId, booking._id)).rejects.toMatchObject({ status: 409 });
		expect((await bookings.findById(booking._id))!.bookingStatus).toBe('PENDING');
	});
	it('lets the member cancel and releases inventory while preserving history', async () => {
		const booking = await bookingService.createBooking(guestId, input({ rooms: 2, guests: 4 }));
		await expect(
			bookingService.cancelBooking(new Types.ObjectId(), MemberType.USER, booking._id),
		).rejects.toMatchObject({ status: 404 });
		await expect(
			bookingService.cancelBooking(new Types.ObjectId(), MemberType.HOTEL_OWNER, booking._id),
		).rejects.toMatchObject({ status: 404 });
		const cancelled = await bookingService.cancelBooking(guestId, MemberType.USER, booking._id);
		expect(cancelled.bookingStatus).toBe('CANCELLED');
		expect((await available()).list[0].availableQuantity).toBe(2);
		expect(await bookings.countDocuments()).toBe(1);
		await expect(bookingService.confirmBooking(ownerId, booking._id)).rejects.toMatchObject({ status: 409 });
		await expect(bookingService.cancelBooking(guestId, MemberType.USER, booking._id)).rejects.toMatchObject({
			status: 409,
		});
	});
	it('lets the hotel owner cancel a confirmed reservation', async () => {
		const booking = await bookingService.createBooking(guestId, input());
		await bookingService.confirmBooking(ownerId, booking._id);
		expect((await bookingService.cancelBooking(ownerId, MemberType.HOTEL_OWNER, booking._id)).bookingStatus).toBe(
			'CANCELLED',
		);
	});
	it('does not complete a pending or future reservation', async () => {
		const booking = await bookingService.createBooking(guestId, input());
		await expect(bookingService.completeBooking(ownerId, booking._id)).rejects.toMatchObject({ status: 409 });
		await bookingService.confirmBooking(ownerId, booking._id);
		await expect(bookingService.completeBooking(ownerId, booking._id)).rejects.toMatchObject({ status: 409 });
	});
	it('completes only the owning hotel reservation and protects its terminal status', async () => {
		const booking = await seed('2020-01-01', '2020-01-03', 1);
		await expect(bookingService.completeBooking(new Types.ObjectId(), booking._id)).rejects.toMatchObject({
			status: 404,
		});
		expect((await bookingService.completeBooking(ownerId, booking._id)).bookingStatus).toBe('COMPLETED');
		await expect(bookingService.cancelBooking(guestId, MemberType.USER, booking._id)).rejects.toMatchObject({
			status: 409,
		});
		await expect(bookingService.completeBooking(ownerId, booking._id)).rejects.toMatchObject({ status: 409 });
	});
	it('never overwrites cancellation when confirmation races with it', async () => {
		const booking = await bookingService.createBooking(guestId, input());
		const results = await Promise.allSettled([
			bookingService.confirmBooking(ownerId, booking._id),
			bookingService.cancelBooking(guestId, MemberType.USER, booking._id),
		]);
		expect(results[1].status).toBe('fulfilled');
		expect((await bookings.findById(booking._id))!.bookingStatus).toBe('CANCELLED');
	}, 30000);
	it('scopes owner lists and totals before pagination, including filters and stable ordering', async () => {
		const createdAt = new Date('2035-01-01T00:00:00Z');
		await seed('2035-09-10', '2035-09-12', 1, { createdAt });
		await seed('2035-09-11', '2035-09-13', 1, { createdAt });
		await seed('2035-09-15', '2035-09-17', 1, { createdAt, bookingStatus: 'CANCELLED' });
		const foreignHotel = await hotels.create({
			...(await hotels.findById(hotelId))!.toObject(),
			_id: new Types.ObjectId(),
			ownerId: new Types.ObjectId(),
		});
		const foreignRoom = await rooms.create({
			...(await rooms.findById(roomId))!.toObject(),
			_id: new Types.ObjectId(),
			hotelId: foreignHotel._id,
		});
		const foreignBooking = await seed('2035-09-10', '2035-09-12', 1, {
			hotelId: foreignHotel._id,
			roomId: foreignRoom._id,
			createdAt,
		});
		const first = await bookingService.getOwnerBookings(ownerId, { page: 1, limit: 1 });
		const second = await bookingService.getOwnerBookings(ownerId, { page: 2, limit: 1 });
		expect(first.metaCounter).toEqual([{ total: 3 }]);
		expect(second.metaCounter).toEqual([{ total: 3 }]);
		expect(first.list).toHaveLength(1);
		expect(String(first.list[0]._id)).not.toBe(String(second.list[0]._id));
		expect(String(first.list[0].hotelId)).toBe(String(hotelId));
		const filtered = await bookingService.getOwnerBookings(ownerId, {
			page: 1,
			limit: 20,
			hotelId: String(hotelId),
			bookingStatus: BookingStatus.CONFIRMED,
			checkIn: '2035-09-12',
			checkOut: '2035-09-14',
		});
		expect(filtered.metaCounter).toEqual([{ total: 1 }]);
		expect(filtered.list[0].checkIn.toISOString().slice(0, 10)).toBe('2035-09-11');
		expect(
			await bookingService.getOwnerBookings(ownerId, { page: 1, limit: 20, hotelId: String(foreignHotel._id) }),
		).toEqual({ list: [], metaCounter: [] });
		await expect(bookingService.getOwnerBooking(ownerId, foreignBooking._id)).rejects.toMatchObject({ status: 404 });
		expect((await bookingService.getOwnerBookings(new Types.ObjectId(), { page: 1, limit: 20 })).metaCounter).toEqual(
			[],
		);
	});
	it('returns projected guest and hotel/room data without leaking credentials or changing booking prices', async () => {
		await members.create({
			_id: guestId,
			memberNick: 'guest',
			memberEmail: 'guest@test.invalid',
			memberPassword: 'private-hash',
			memberPhone: '01012345678',
		});
		const booking = await bookingService.createBooking(guestId, input());
		await roomService.updateRoom(ownerId, { _id: String(roomId), roomPrice: 30 });
		const ownerDetail = await bookingService.getOwnerBooking(ownerId, booking._id);
		expect(ownerDetail.hotelData!.hotelName).toBe('Test Hotel');
		expect(ownerDetail.roomData!.roomName).toBe('Deluxe Room');
		expect(Object.keys(ownerDetail.memberData!).sort()).toEqual(['_id', 'memberImage', 'memberNick']);
		expect(ownerDetail.memberData!.memberNick).toBe('guest');
		expect(ownerDetail.pricePerNight).toBe(19.99);
		expect(ownerDetail.totalPrice).toBe(59.97);
		const memberDetail = await bookingService.getBooking(guestId, booking._id);
		expect(memberDetail.hotelData).toEqual(ownerDetail.hotelData);
		const list = await bookingService.getMyBookings(guestId, { page: 1, limit: 20 });
		expect(list.list[0].roomData).toEqual(ownerDetail.roomData);
		await expect(bookingService.getBooking(ownerId, booking._id)).rejects.toMatchObject({ status: 404 });
	});
	it('preserves owner history for soft-deleted hotels and member history when related documents are absent', async () => {
		const booking = await bookingService.createBooking(guestId, input());
		await bookingService.cancelBooking(guestId, MemberType.USER, booking._id);
		await roomService.deleteRoom(ownerId, roomId);
		await hotelService.deleteHotel(ownerId, hotelId);
		expect((await bookingService.getOwnerBooking(ownerId, booking._id)).hotelData!.hotelName).toBe('Test Hotel');
		expect((await bookingService.getOwnerBookings(ownerId, { page: 1, limit: 20 })).metaCounter).toEqual([
			{ total: 1 },
		]);
		// Only this isolated test database: simulate missing referenced documents.
		await hotels.deleteOne({ _id: hotelId });
		await rooms.deleteOne({ _id: roomId });
		const detail = await bookingService.getBooking(guestId, booking._id);
		expect(detail.hotelData).toBeUndefined();
		expect(detail.roomData).toBeUndefined();
		expect(detail.memberData).toBeUndefined();
		expect(detail.bookingStatus).toBe('CANCELLED');
		expect((await bookingService.getMyBookings(guestId, { page: 1, limit: 20 })).metaCounter).toEqual([{ total: 1 }]);
	});
});
