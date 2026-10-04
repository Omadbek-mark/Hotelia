import { randomUUID } from 'crypto';
import { createConnection, Connection, Model, Types } from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import HotelSchema from '../../src/schemas/Hotel.model';
import RoomSchema from '../../src/schemas/Room.model';
import BookingSchema from '../../src/schemas/Booking.model';
import MemberSchema from '../../src/schemas/Member.model';
import { HotelService } from '../../src/components/hotel/hotel.service';
import { RoomService } from '../../src/components/room/room.service';
import { BookingService } from '../../src/components/booking/booking.service';
import { MemberService } from '../../src/components/member/member.service';
import { RoomSort } from '../../src/libs/enums/room.enum';
import { MemberType } from '../../src/libs/enums/member.enum';
import { getStayDates } from '../../src/libs/booking/stay-dates';

// Opt-in: starts an isolated real MongoDB replica set; never reads the application .env.
const integration = process.env.RUN_MONGO_INTEGRATION === '1' ? describe : describe.skip;
integration('Booking transactions against real MongoDB', () => {
	let repl: MongoMemoryReplSet;
	let connection: Connection;
	let hotels: Model<any>, rooms: Model<any>, bookings: Model<any>, members: Model<any>;
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
		await Promise.all([hotels.init(), rooms.init(), bookings.init(), members.init()]);
		const memberService = new MemberService(members, {} as any, {} as any, {} as any, {} as any);
		hotelService = new HotelService(connection, memberService, {} as any, hotels, bookings);
		roomService = new RoomService(rooms, hotelService, connection, bookings);
		bookingService = new BookingService(bookings, rooms, connection, hotelService);
	}, 180000);
	afterAll(async () => {
		await connection?.close();
		await repl?.stop();
	});
	beforeEach(async () => {
		await Promise.all([bookings.deleteMany({}), rooms.deleteMany({}), hotels.deleteMany({}), members.deleteMany({})]);
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
});
