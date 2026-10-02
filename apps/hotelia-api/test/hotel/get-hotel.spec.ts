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

describe('getHotel GraphQL', () => {
	let app: INestApplication;
	const id = new Types.ObjectId();
	const storage = { findOne: jest.fn(), findOneAndUpdate: jest.fn(), aggregate: jest.fn() };
	const members = { getHotelOwner: jest.fn() };
	const views = { recordView: jest.fn() };
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
				{ provide: getModelToken('Hotel'), useValue: storage },
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
	it('sorts popularity by views and propagates database failures', async () => {
		const failure = new Error('database unavailable');
		storage.aggregate.mockReturnValue({
			exec: async () => {
				throw failure;
			},
		});
		expect((await runList({ sort: 'MOST_POPULAR' })).errors?.[0].originalError).toBe(failure);
		expect(storage.aggregate.mock.calls[0][0][1].$sort).toEqual({ hotelViews: -1, _id: -1 });
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
