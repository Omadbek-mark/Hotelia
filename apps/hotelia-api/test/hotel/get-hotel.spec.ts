import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule, GraphQLSchemaHost } from '@nestjs/graphql';
import { graphql } from 'graphql';
import { Types } from 'mongoose';
import { ViewService } from '../../src/components/view/view.service';
import { HotelService } from '../../src/components/hotel/hotel.service';
import { HotelResolver } from '../../src/components/hotel/hotel.resolver';
import { MemberService } from '../../src/components/member/member.service';
import { AuthService } from '../../src/components/auth/auth.service';
import { HotelStatus } from '../../src/libs/enums/hotel.enum';
import { LikeService } from '../../src/components/like/like.service';

describe('getHotel GraphQL', () => {
	let app: INestApplication;
	const id = new Types.ObjectId();
	const storage = { findOne: jest.fn(), findOneAndUpdate: jest.fn(), aggregate: jest.fn() };
	const bookings = { exists: jest.fn() };
	const members = { getHotelOwner: jest.fn(), memberStatsEditor: jest.fn() };
	const views = { recordView: jest.fn() };
	const likes = { attachFavoriteStatus: jest.fn(), setHotelFavorite: jest.fn(), getFavoriteHotels: jest.fn() };
	const session = {};
	const connection = { transaction: jest.fn(async (callback) => callback(session)) };
	const auth = { verifyToken: jest.fn() };
	beforeAll(async () => {
		const module = await Test.createTestingModule({
			imports: [GraphQLModule.forRoot({ driver: ApolloDriver, autoSchemaFile: true })],
			providers: [
				HotelService,
				HotelResolver,
				{ provide: getConnectionToken(), useValue: connection },
				{ provide: ViewService, useValue: views },
				{ provide: LikeService, useValue: likes },
				{ provide: getModelToken('Hotel'), useValue: storage },
				{ provide: getModelToken('Booking'), useValue: bookings },
				{ provide: MemberService, useValue: members },
				{ provide: AuthService, useValue: auth },
			],
		}).compile();
		app = module.createNestApplication();
		app.useLogger(false);
		await app.init();
	});
	afterAll(async () => app?.close());
	beforeEach(() => {
		jest.resetAllMocks();
		likes.attachFavoriteStatus.mockImplementation(async (hotels) => {
			for (const hotel of hotels) hotel.isFavorite = false;
		});
		bookings.exists.mockReturnValue({ session: () => ({ exec: async () => null }) });
		connection.transaction.mockImplementation(async (callback) => callback(session));
		members.getHotelOwner.mockResolvedValue(null);
		storage.findOne.mockReturnValue({
			lean: () => ({
				exec: async () => ({ _id: id, hotelName: 'Seoul Stay', hotelStatus: HotelStatus.ACTIVE, hotelViews: 4 }),
			}),
		});
	});
	const run = (hotelId = String(id), token?: string) =>
		graphql({
			schema: app.get(GraphQLSchemaHost).schema,
			source:
				'query($id:String!){getHotel(hotelId:$id){_id hotelName hotelStatus hotelViews memberData{_id memberNick memberImage memberDesc}}}',
			variableValues: { id: hotelId },
			contextValue: { req: { headers: token ? { authorization: `Bearer ${token}` } : {} } },
		});
	const runList = (input: unknown) =>
		graphql({
			schema: app.get(GraphQLSchemaHost).schema,
			source:
				'query($input:HotelsInquiry!){getHotels(input:$input){list{_id memberData{memberNick}} metaCounter{total}}}',
			variableValues: { input },
			contextValue: { req: { headers: {} } },
		});
	const adminRun = (source: string, input: unknown, signedIn = true) =>
		graphql({
			schema: app.get(GraphQLSchemaHost).schema,
			source,
			variableValues: { input },
			contextValue: { req: { headers: signedIn ? { authorization: 'Bearer valid' } : {} } },
		});
	const adminQueries = [
		['query($input:AllHotelsInquiry!){getAllHotelsByAdmin(input:$input){list{_id} metaCounter{total}}}', {}],
		['query($input:String!){getHotelByAdmin(hotelId:$input){_id hotelStatus}}', String(id)],
		[
			'mutation($input:AdminHotelUpdate!){updateHotelByAdmin(input:$input){_id hotelStatus}}',
			{ _id: String(id), hotelStatus: 'PAUSED' },
		],
	] as const;
	it('denies all hotel admin operations to guests, users and owners', async () => {
		for (const role of ['USER', 'HOTEL_OWNER', 'GUEST']) {
			auth.verifyToken.mockResolvedValue({ _id: id, memberType: role });
			for (const [source, input] of adminQueries)
				expect((await adminRun(source, input, role !== 'GUEST')).errors).toBeDefined();
		}
		expect(storage.aggregate).not.toHaveBeenCalled();
		expect(storage.findOne).not.toHaveBeenCalled();
		expect(storage.findOneAndUpdate).not.toHaveBeenCalled();
	});
	it('filters admin hotel lists by owner and status and reads deleted detail without views', async () => {
		auth.verifyToken.mockResolvedValue({ _id: id, memberType: 'ADMIN' });
		storage.aggregate.mockReturnValue({ exec: async () => [{ list: [], metaCounter: [] }] });
		expect((await adminRun(adminQueries[0][0], { ownerId: String(id), hotelStatus: 'DELETE' })).errors).toBeUndefined();
		expect(storage.aggregate.mock.calls[0][0][0]).toEqual({ $match: { ownerId: id, hotelStatus: 'DELETE' } });
		storage.findOne.mockReturnValue({ lean: () => ({ exec: async () => ({ _id: id, hotelStatus: 'DELETE' }) }) });
		expect((await adminRun(adminQueries[1][0], String(id))).errors).toBeUndefined();
		expect(storage.findOne).toHaveBeenCalledWith({ _id: id });
		expect(views.recordView).not.toHaveBeenCalled();
	});
	it('allows admin status changes only on nondeleted hotels and rejects forged update fields', async () => {
		auth.verifyToken.mockResolvedValue({ _id: id, memberType: 'ADMIN' });
		for (const change of [{ hotelStatus: 'DELETE' }, { ownerId: String(id) }, { hotelLikes: 50 }, { _id: 'bad' }]) {
			expect(
				(await adminRun(adminQueries[2][0], { _id: String(id), hotelStatus: 'PAUSED', ...change })).errors,
			).toBeDefined();
		}
		expect(storage.findOneAndUpdate).not.toHaveBeenCalled();
		storage.findOneAndUpdate.mockReturnValue({ exec: async () => ({ _id: id, hotelStatus: 'PAUSED' }) });
		expect((await adminRun(...adminQueries[2])).errors).toBeUndefined();
		expect(storage.findOneAndUpdate).toHaveBeenCalledWith(
			{ _id: id, hotelStatus: { $in: ['ACTIVE', 'PAUSED'] } },
			{ $set: { hotelStatus: 'PAUSED' } },
			{ new: true, runValidators: true },
		);
		expect(members.memberStatsEditor).not.toHaveBeenCalled();
		storage.findOneAndUpdate.mockReturnValue({ exec: async () => null });
		expect(((await adminRun(...adminQueries[2])).errors?.[0].originalError as any).getStatus()).toBe(404);
	});
	const favoriteMutation = (action: string, hotelId = String(id), signedIn = true) =>
		graphql({
			schema: app.get(GraphQLSchemaHost).schema,
			source: `mutation($id:String!){${action}(hotelId:$id){hotelId isFavorite hotelLikes}}`,
			variableValues: { id: hotelId },
			contextValue: { req: { headers: signedIn ? { authorization: 'Bearer valid' } : {} } },
		});
	it.each(['favoriteHotel', 'unfavoriteHotel'])('%s requires authentication and a valid hotel ID', async (action) => {
		expect((await favoriteMutation(action, undefined, false)).errors).toBeDefined();
		auth.verifyToken.mockResolvedValue({ _id: id, memberType: 'USER' });
		expect((await favoriteMutation(action, 'bad')).errors).toBeDefined();
		expect(likes.setHotelFavorite).not.toHaveBeenCalled();
		likes.setHotelFavorite.mockResolvedValue({ hotelId: id, isFavorite: action === 'favoriteHotel', hotelLikes: 1 });
		expect((await favoriteMutation(action)).errors).toBeUndefined();
		expect(likes.setHotelFavorite).toHaveBeenCalledWith(id, id, action === 'favoriteHotel');
	});
	it('validates favorites pagination and obtains member identity from authentication', async () => {
		const query = (input: unknown, signedIn = true) =>
			graphql({
				schema: app.get(GraphQLSchemaHost).schema,
				source: 'query($input:FavoritesInquiry!){getFavorites(input:$input){list{_id isFavorite} metaCounter{total}}}',
				variableValues: { input },
				contextValue: { req: { headers: signedIn ? { authorization: 'Bearer valid' } : {} } },
			});
		expect((await query({}, false)).errors).toBeDefined();
		auth.verifyToken.mockResolvedValue({ _id: id, memberType: 'USER' });
		for (const input of [{ page: 0 }, { limit: 101 }, { memberId: String(id) }])
			expect((await query(input)).errors).toBeDefined();
		expect(likes.getFavoriteHotels).not.toHaveBeenCalled();
		likes.getFavoriteHotels.mockResolvedValue({ list: [], metaCounter: [] });
		expect((await query({})).errors).toBeUndefined();
		expect(likes.getFavoriteHotels).toHaveBeenCalledWith(id, expect.objectContaining({ page: 1, limit: 20 }));
	});
	it('personalizes public hotel detail and list without requiring guest authentication', async () => {
		await run();
		expect(likes.attachFavoriteStatus).toHaveBeenLastCalledWith(expect.any(Array), null);
		auth.verifyToken.mockResolvedValue({ _id: id, memberType: 'USER' });
		views.recordView.mockResolvedValue(false);
		await run(String(id), 'valid');
		expect(likes.attachFavoriteStatus).toHaveBeenLastCalledWith(expect.any(Array), id);
		storage.aggregate.mockReturnValue({ exec: async () => [{ list: [], metaCounter: [] }] });
		expect((await runList({})).errors).toBeUndefined();
		expect(likes.attachFavoriteStatus).toHaveBeenLastCalledWith([], null);
	});
	const ownerDetail = (hotelId = String(id), signedIn = true) =>
		graphql({
			schema: app.get(GraphQLSchemaHost).schema,
			source: 'query($id:String!){getOwnerHotel(hotelId:$id){_id hotelStatus memberData{memberNick}}}',
			variableValues: { id: hotelId },
			contextValue: { req: { headers: signedIn ? { authorization: 'Bearer valid' } : {} } },
		});
	it.each(['USER', 'ADMIN', 'GUEST'])('denies owner detail to %s', async (role) => {
		auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId(), memberType: role });
		expect((await ownerDetail(String(id), role !== 'GUEST')).errors).toBeDefined();
		expect(storage.findOne).not.toHaveBeenCalled();
	});
	it.each(['ACTIVE', 'PAUSED'])('returns an owned %s detail without recording a view', async (status) => {
		const ownerId = new Types.ObjectId();
		auth.verifyToken.mockResolvedValue({ _id: ownerId, memberType: 'HOTEL_OWNER' });
		storage.findOne.mockReturnValue({
			lean: () => ({ exec: async () => ({ _id: id, ownerId, hotelStatus: status }) }),
		});
		members.getHotelOwner.mockResolvedValue({ memberNick: 'host' });
		const result = await ownerDetail();
		expect(result.errors).toBeUndefined();
		expect(result.data?.getOwnerHotel).toMatchObject({ hotelStatus: status, memberData: { memberNick: 'host' } });
		expect(storage.findOne).toHaveBeenCalledWith({ _id: id, ownerId, hotelStatus: { $in: ['ACTIVE', 'PAUSED'] } });
		expect(views.recordView).not.toHaveBeenCalled();
		expect(storage.findOneAndUpdate).not.toHaveBeenCalled();
	});
	it('rejects an invalid owner detail ID before querying the database', async () => {
		auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId(), memberType: 'HOTEL_OWNER' });
		expect((await ownerDetail('invalid')).errors).toBeDefined();
		expect(storage.findOne).not.toHaveBeenCalled();
	});
	it('returns not-found for a detail outside the owner/status filter', async () => {
		auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId(), memberType: 'HOTEL_OWNER' });
		storage.findOne.mockReturnValue({ lean: () => ({ exec: async () => null }) });
		expect(((await ownerDetail()).errors?.[0].originalError as any).getStatus()).toBe(404);
		expect(members.getHotelOwner).not.toHaveBeenCalled();
	});
	it('propagates database errors from owner detail', async () => {
		auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId(), memberType: 'HOTEL_OWNER' });
		const error = new Error('database unavailable');
		storage.findOne.mockReturnValue({
			lean: () => ({
				exec: async () => {
					throw error;
				},
			}),
		});
		expect((await ownerDetail()).errors?.[0].originalError).toBe(error);
	});
	const ownerList = (input: unknown, signedIn = true) =>
		graphql({
			schema: app.get(GraphQLSchemaHost).schema,
			source:
				'query($input:OwnerHotelsInquiry!){getOwnerHotels(input:$input){list{_id hotelStatus} metaCounter{total}}}',
			variableValues: { input },
			contextValue: { req: { headers: signedIn ? { authorization: 'Bearer valid' } : {} } },
		});
	it.each(['USER', 'ADMIN', 'GUEST'])('denies owner list access to %s', async (role) => {
		auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId(), memberType: role });
		expect((await ownerList({}, role !== 'GUEST')).errors).toBeDefined();
		expect(storage.aggregate).not.toHaveBeenCalled();
	});
	it.each([{}, { hotelStatus: 'ACTIVE' }, { hotelStatus: 'PAUSED' }])(
		'scopes owner list and count to the authenticated owner: %j',
		async (input) => {
			const ownerId = new Types.ObjectId();
			auth.verifyToken.mockResolvedValue({ _id: ownerId, memberType: 'HOTEL_OWNER' });
			storage.aggregate.mockReturnValue({ exec: async () => [{ list: [], metaCounter: [] }] });
			const result = await ownerList({ ...input, page: 2, limit: 5, search: { hotelType: 'RESORT' } });
			expect(result.errors).toBeUndefined();
			const pipeline = storage.aggregate.mock.calls[0][0];
			expect(pipeline[0].$match).toEqual({
				ownerId,
				hotelStatus: input.hotelStatus ?? { $in: ['ACTIVE', 'PAUSED'] },
				hotelType: 'RESORT',
			});
			expect(pipeline[2].$facet.list.slice(0, 2)).toEqual([{ $skip: 5 }, { $limit: 5 }]);
			expect(pipeline[2].$facet.metaCounter).toEqual([{ $count: 'total' }]);
		},
	);
	it.each([
		{ hotelStatus: 'DELETE' },
		{ hotelStatus: null },
		{ ownerId: String(id) },
		{ page: 0 },
		{ search: { minRating: 6 } },
	])('rejects invalid owner inquiry %j', async (input) => {
		auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId(), memberType: 'HOTEL_OWNER' });
		expect((await ownerList(input)).errors).toBeDefined();
		expect(storage.aggregate).not.toHaveBeenCalled();
	});
	const update = (input: unknown, signedIn = true) =>
		graphql({
			schema: app.get(GraphQLSchemaHost).schema,
			source: 'mutation($input:HotelUpdate!){updateHotel(input:$input){_id hotelName hotelStatus}}',
			variableValues: { input },
			contextValue: { req: { headers: signedIn ? { authorization: 'Bearer valid' } : {} } },
		});
	const remove = (hotelId = String(id), signedIn = true) =>
		graphql({
			schema: app.get(GraphQLSchemaHost).schema,
			source: 'mutation($id:String!){deleteHotel(hotelId:$id){_id hotelStatus deletedAt}}',
			variableValues: { id: hotelId },
			contextValue: { req: { headers: signedIn ? { authorization: 'Bearer valid' } : {} } },
		});
	it.each(['USER', 'ADMIN', 'GUEST'])('denies hotel deletion from %s', async (role) => {
		auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId(), memberType: role });
		expect((await remove(String(id), role !== 'GUEST')).errors).toBeDefined();
		expect(connection.transaction).not.toHaveBeenCalled();
		expect(storage.findOneAndUpdate).not.toHaveBeenCalled();
	});
	it('rejects malformed delete IDs before opening a transaction', async () => {
		auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId(), memberType: 'HOTEL_OWNER' });
		expect((await remove('invalid')).errors).toBeDefined();
		expect(connection.transaction).not.toHaveBeenCalled();
	});
	it.each(['ACTIVE', 'PAUSED'])('soft deletes an owned %s hotel and decrements only once', async (status) => {
		const ownerId = new Types.ObjectId();
		auth.verifyToken.mockResolvedValue({ _id: ownerId, memberType: 'HOTEL_OWNER' });
		let hotel = { _id: id, ownerId, hotelStatus: status };
		storage.findOneAndUpdate.mockImplementation((filter, change, options) => ({
			exec: async () => {
				expect(options.session).toBe(session);
				expect(filter.ownerId).toEqual(ownerId);
				expect(filter._id).toEqual(id);
				if (!filter.hotelStatus.$in.includes(hotel.hotelStatus)) return null;
				hotel = { ...hotel, ...change.$set };
				return hotel;
			},
		}));
		const first = await remove();
		expect(first.errors).toBeUndefined();
		expect(first.data?.deleteHotel).toMatchObject({ hotelStatus: 'DELETE', deletedAt: expect.any(String) });
		expect(members.memberStatsEditor).toHaveBeenCalledWith(
			{ _id: ownerId, targetKey: 'memberHotels', modifier: -1 },
			session,
		);
		expect((await remove()).errors).toBeDefined();
		expect(members.memberStatsEditor).toHaveBeenCalledTimes(1);
	});
	it('does not decrement when the hotel ownership/status filter fails', async () => {
		auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId(), memberType: 'HOTEL_OWNER' });
		storage.findOneAndUpdate.mockReturnValue({ exec: async () => null });
		expect((await remove()).errors).toBeDefined();
		expect(members.memberStatsEditor).not.toHaveBeenCalled();
	});
	it('propagates counter failure out of the transaction callback', async () => {
		auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId(), memberType: 'HOTEL_OWNER' });
		storage.findOneAndUpdate.mockReturnValue({ exec: async () => ({ _id: id, hotelStatus: 'DELETE' }) });
		const failure = new Error('counter update failed');
		members.memberStatsEditor.mockRejectedValue(failure);
		const aborted = jest.fn();
		connection.transaction.mockImplementation(async (callback) => {
			try {
				return await callback(session);
			} catch (error) {
				aborted();
				throw error;
			}
		});
		expect((await remove()).errors?.[0].originalError).toBe(failure);
		expect(aborted).toHaveBeenCalledTimes(1);
	});
	it.each(['USER', 'ADMIN', 'GUEST'])('denies hotel updates from %s', async (role) => {
		auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId(), memberType: role });
		expect((await update({ _id: String(id), hotelName: 'Changed Hotel' }, role !== 'GUEST')).errors).toBeDefined();
		expect(storage.findOneAndUpdate).not.toHaveBeenCalled();
	});
	it.each([
		{ _id: 'invalid', hotelName: 'Changed Hotel' },
		{ _id: String(id) },
		{ _id: String(id), hotelName: null },
		{ _id: String(id), hotelStatus: 'DELETE' },
		{ _id: String(id), hotelImages: [] },
		{ _id: String(id), ownerId: String(id) },
		{ _id: String(id), hotelViews: 100 },
	])('rejects invalid hotel updates %j', async (input) => {
		auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId(), memberType: 'HOTEL_OWNER' });
		expect((await update(input)).errors).toBeDefined();
		expect(storage.findOneAndUpdate).not.toHaveBeenCalled();
	});
	it.each(['ACTIVE', 'PAUSED'])('updates an owned hotel to %s with an atomic owner filter', async (status) => {
		const ownerId = new Types.ObjectId();
		auth.verifyToken.mockResolvedValue({ _id: ownerId, memberType: 'HOTEL_OWNER' });
		storage.findOneAndUpdate.mockReturnValue({
			exec: async () => ({ _id: id, hotelName: 'Changed Hotel', hotelStatus: status }),
		});
		const result = await update({
			_id: String(id),
			hotelName: '  Changed Hotel  ',
			hotelStatus: status,
			hotelAmenities: [],
		});
		expect(result.errors).toBeUndefined();
		expect(storage.findOneAndUpdate).toHaveBeenCalledWith(
			{
				_id: id,
				ownerId,
				hotelStatus: { $in: ['ACTIVE', 'PAUSED'] },
			},
			{ $set: { hotelName: 'Changed Hotel', hotelStatus: status, hotelAmenities: [] } },
			{ new: true, runValidators: true },
		);
		expect(connection.transaction).not.toHaveBeenCalled();
	});
	it('returns not-found when the ownership/status filter does not match', async () => {
		auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId(), memberType: 'HOTEL_OWNER' });
		storage.findOneAndUpdate.mockReturnValue({ exec: async () => null });
		const result = await update({ _id: String(id), hotelName: 'Changed Hotel' });
		expect((result.errors?.[0].originalError as any).getStatus()).toBe(404);
	});
	it('does not disguise an update database failure', async () => {
		auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId(), memberType: 'HOTEL_OWNER' });
		const failure = new Error('Database unavailable');
		storage.findOneAndUpdate.mockReturnValue({
			exec: async () => {
				throw failure;
			},
		});
		expect((await update({ _id: String(id), hotelName: 'Changed Hotel' })).errors?.[0].originalError).toBe(failure);
	});
	it('accepts a guest search with default pagination and returns an empty list', async () => {
		storage.aggregate.mockReturnValue({ exec: async () => [{ list: [], metaCounter: [] }] });
		const result = await runList({});
		expect(result.errors).toBeUndefined();
		expect(result.data?.getHotels).toEqual({ list: [], metaCounter: [] });
		const pipeline = storage.aggregate.mock.calls[0][0];
		expect(pipeline[0].$match).toEqual({ hotelStatus: 'ACTIVE' });
		expect(pipeline[1].$sort).toEqual({ createdAt: -1, _id: -1 });
		expect(pipeline[2].$facet.list.slice(0, 2)).toEqual([{ $skip: 0 }, { $limit: 20 }]);
	});
	it.each([
		{ page: 0 },
		{ limit: 101 },
		{ page: 1.5 },
		{ sort: 'UNKNOWN' },
		{ search: { minRating: 6 } },
		{ search: { amenities: ['WIFI', 'WIFI'] } },
		{ search: null },
	])('rejects invalid hotel inquiry %j before database access', async (input) => {
		expect((await runList(input)).errors).toBeDefined();
		expect(storage.aggregate).not.toHaveBeenCalled();
	});
	it('combines literal text and destination with all amenities, rating and type', async () => {
		storage.aggregate.mockReturnValue({ exec: async () => [{ list: [], metaCounter: [{ total: 25 }] }] });
		const result = await runList({
			page: 3,
			limit: 10,
			sort: 'RATING',
			search: {
				text: ' Stay+ ',
				destination: ' [Seoul] ',
				minRating: 0,
				hotelType: 'RESORT',
				amenities: ['WIFI', 'POOL'],
			},
		});
		expect(result.errors).toBeUndefined();
		expect(result.data?.getHotels).toEqual({ list: [], metaCounter: [{ total: 25 }] });
		const pipeline = storage.aggregate.mock.calls[0][0];
		const match = pipeline[0].$match;
		expect(match.hotelStatus).toBe('ACTIVE');
		const name = new RegExp(match.hotelName.$regex, 'i');
		expect(name.test('stay+')).toBe(true);
		expect(name.test('stayy')).toBe(false);
		const destination = new RegExp(match.$or[0].hotelCountry.$regex, 'i');
		expect(destination.test('[Seoul]')).toBe(true);
		expect(destination.test('Seoul')).toBe(false);
		expect(match.hotelAmenities).toEqual({ $all: ['WIFI', 'POOL'] });
		expect(match.hotelRating).toEqual({ $gte: 0 });
		expect(match.hotelType).toBe('RESORT');
		expect(pipeline[1].$sort).toEqual({ hotelRating: -1, _id: -1 });
		const facet = pipeline[2].$facet;
		expect(facet.list.slice(0, 2)).toEqual([{ $skip: 20 }, { $limit: 10 }]);
		expect(facet.metaCounter).toEqual([{ $count: 'total' }]);
		expect(facet.list[2].$lookup.localField).toBe('ownerId');
		expect(facet.list[2].$lookup.pipeline[1].$project).toEqual({
			_id: 1,
			memberNick: 1,
			memberImage: 1,
			memberDesc: 1,
		});
		expect(facet.list[3].$unwind.preserveNullAndEmptyArrays).toBe(true);
	});
	it('accepts MOST_LIKED and ranks the full active catalog by like count before pagination', async () => {
        storage.aggregate.mockReturnValue({ exec: async () => [{ list: [], metaCounter: [] }] });
        const result = await runList({ page: 1, limit: 3, sort: 'MOST_LIKED', search: {} });
        expect(result.errors).toBeUndefined();
        const pipeline = storage.aggregate.mock.calls[0][0];
        expect(pipeline[0].$match.hotelStatus).toBe(HotelStatus.ACTIVE);
        expect(pipeline[1].$sort).toEqual({ hotelLikes: -1, _id: -1 });
        expect(pipeline.find(stage => stage.$facet).$facet.list[1]).toEqual({ $limit: 3 });
    });
	it('sorts popularity by views and propagates database failures', async () => {
		const failure = new Error('database unavailable');
		storage.aggregate.mockReturnValue({
			exec: async () => {
				throw failure;
			},
		});
		expect((await runList({ sort: 'MOST_POPULAR' })).errors?.[0].originalError).toBe(failure);
		expect(storage.aggregate.mock.calls[0][0][1].$sort).toEqual({ hotelRank: -1, hotelViews: -1, _id: -1 });
	});
	it('returns an ACTIVE hotel to a guest without modifying views', async () => {
		storage.findOne.mockReturnValue({
			lean: () => ({
				exec: async () => ({ _id: id, hotelName: 'Seoul Stay', hotelStatus: HotelStatus.ACTIVE, hotelViews: 4 }),
			}),
		});
		const result = await run();
		expect(result.errors).toBeUndefined();
		expect(result.data?.getHotel).toMatchObject({ _id: String(id), hotelName: 'Seoul Stay', hotelViews: 4 });
		expect(storage.findOne).toHaveBeenCalledWith({ _id: id, hotelStatus: HotelStatus.ACTIVE });
		expect(auth.verifyToken).not.toHaveBeenCalled();
	});
	it.each([HotelStatus.PAUSED, HotelStatus.DELETE, 'MISSING'])('does not expose %s hotels', async (status) => {
		storage.findOne.mockImplementation((filter) => ({
			lean: () => ({ exec: async () => (status === filter.hotelStatus ? { _id: id } : null) }),
		}));
		const result = await run();
		expect((result.errors?.[0].originalError as any).getStatus()).toBe(404);
		expect(result.data).toBeNull();
	});
	it('rejects malformed IDs before querying MongoDB', async () => {
		const result = await run('invalid');
		expect((result.errors?.[0].originalError as any).getStatus()).toBe(400);
		expect(storage.findOne).not.toHaveBeenCalled();
	});
	it('does not disguise database failures as not-found', async () => {
		const failure = new Error('Database unavailable');
		storage.findOne.mockReturnValue({
			lean: () => ({
				exec: async () => {
					throw failure;
				},
			}),
		});
		expect((await run()).errors?.[0].originalError).toBe(failure);
	});
	it('records a signed-in first visit and returns the updated count', async () => {
		const memberId = new Types.ObjectId();
		auth.verifyToken.mockResolvedValue({ _id: memberId });
		storage.findOneAndUpdate.mockReturnValue({
			lean: () => ({
				exec: async () => ({ _id: id, hotelName: 'Seoul Stay', hotelStatus: HotelStatus.ACTIVE, hotelViews: 5 }),
			}),
		});
		views.recordView.mockResolvedValue({ _id: new Types.ObjectId() });
		const result = await run(String(id), 'valid');
		expect(result.errors).toBeUndefined();
		expect(result.data?.getHotel).toMatchObject({ hotelViews: 5 });
		expect(views.recordView).toHaveBeenCalledWith({ memberId, viewRefId: id, viewGroup: 'HOTEL' });
		expect(storage.findOneAndUpdate).toHaveBeenCalledTimes(1);
		expect(storage.findOneAndUpdate.mock.calls[0][2]).toEqual({ new: true, timestamps: false });
	});
	it('does not write the hotel counter for a repeat visit', async () => {
		auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId() });
		views.recordView.mockResolvedValue(null);
		const result = await run(String(id), 'valid');
		expect(result.errors).toBeUndefined();
		expect(result.data?.getHotel).toMatchObject({ hotelViews: 4 });
		expect(storage.findOneAndUpdate).not.toHaveBeenCalled();
		expect(connection.transaction).not.toHaveBeenCalled();
	});
	it('propagates view failure before incrementing the counter', async () => {
		auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId() });
		storage.findOneAndUpdate.mockReturnValue({ lean: () => ({ exec: async () => ({ _id: id }) }) });
		const error = new Error('view write failed');
		views.recordView.mockRejectedValue(error);
		expect((await run(String(id), 'valid')).errors?.[0].originalError).toBe(error);
	});
	it('does not write a view when the signed-in request targets an unavailable hotel', async () => {
		auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId() });
		storage.findOne.mockReturnValue({ lean: () => ({ exec: async () => null }) });
		expect((await run(String(id), 'valid')).errors).toBeDefined();
		expect(views.recordView).not.toHaveBeenCalled();
	});

	it('includes public owner data on the detail response', async () => {
		const owner = { _id: new Types.ObjectId(), memberNick: 'host', memberImage: '', memberDesc: 'Welcome' };
		members.getHotelOwner.mockResolvedValue(owner);
		const result = await run();
		expect(result.errors).toBeUndefined();
		expect((result.data?.getHotel as any).memberData).toMatchObject({ _id: String(owner._id), memberNick: 'host' });
	});
	it('keeps hotel visible with null memberData when no active owner is returned', async () => {
		const result = await run();
		expect(result.errors).toBeUndefined();
		expect((result.data?.getHotel as any).memberData).toBeNull();
	});
	it('filters public hotels by owner without exposing paused hotels', async () => {
		const ownerId = new Types.ObjectId();
		storage.aggregate.mockReturnValue({ exec: async () => [{ list: [], metaCounter: [] }] });
		const result = await runList({ page: 1, limit: 6, sort: 'NEWEST', search: { ownerId: ownerId.toHexString() } });
		expect(result.errors).toBeUndefined();
		expect(storage.aggregate.mock.calls[0][0][0].$match).toMatchObject({ ownerId, hotelStatus: HotelStatus.ACTIVE });
	});
	it('rejects invalid public owner filters', async () => {
		const result = await runList({ page: 1, limit: 6, sort: 'NEWEST', search: { ownerId: 'invalid' } });
		expect(result.errors).toBeDefined();
		expect(storage.aggregate).not.toHaveBeenCalled();
	});
});

describe('public owner projection', () => {
	it('selects only public fields and filters to active hotel owners', async () => {
		const id = new Types.ObjectId();
		const select = jest.fn().mockReturnValue({
			lean: () => ({
				exec: async () => ({
					_id: id,
					memberNick: 'host',
					memberImage: '',
					memberEmail: 'private@example.com',
					memberPassword: 'hash',
					accessToken: 'secret',
				}),
			}),
		});
		const model = { findOne: jest.fn().mockReturnValue({ select }) };
		const service = new MemberService(model as any, {} as any, {} as any, {} as any, {} as any);
		const result = await service.getHotelOwner(id);
		expect(model.findOne).toHaveBeenCalledWith({ _id: id, memberStatus: 'ACTIVE', memberType: 'HOTEL_OWNER' });
		expect(select).toHaveBeenCalledWith('_id memberNick memberImage memberDesc');
		expect(result).not.toHaveProperty('memberEmail');
		expect(result).not.toHaveProperty('memberPassword');
		expect(result).not.toHaveProperty('accessToken');
	});
});
