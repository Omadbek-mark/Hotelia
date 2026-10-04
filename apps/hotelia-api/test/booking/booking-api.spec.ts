import { HotelService } from '../../src/components/hotel/hotel.service';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule, GraphQLSchemaHost } from '@nestjs/graphql';
import { graphql } from 'graphql';
import { Types } from 'mongoose';
import { BookingService } from '../../src/components/booking/booking.service';
import { BookingResolver } from '../../src/components/booking/booking.resolver';
import { AuthService } from '../../src/components/auth/auth.service';

const memberId = new Types.ObjectId();
const bookingId = new Types.ObjectId();
describe('Booking read API', () => {
	let app: INestApplication;
	const storage = { findOne: jest.fn(), aggregate: jest.fn() };
	const auth = { verifyToken: jest.fn() };
	const hotels = { getOwnerInventoryCounts: jest.fn() };
	beforeAll(async () => {
		const module = await Test.createTestingModule({
			imports: [GraphQLModule.forRoot({ driver: ApolloDriver, autoSchemaFile: true })],
			providers: [
				BookingService,
				BookingResolver,
				{ provide: getModelToken('Booking'), useValue: storage },
				{ provide: getModelToken('Room'), useValue: {} },
				{ provide: getConnectionToken(), useValue: {} },
				{ provide: HotelService, useValue: hotels },
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
		auth.verifyToken.mockResolvedValue({ _id: memberId, memberType: 'USER' });
		storage.findOne.mockReturnValue({
			lean: () => ({ exec: async () => ({ _id: bookingId, memberId, bookingStatus: 'CANCELLED', totalPrice: 500 }) }),
		});
		storage.aggregate.mockImplementation((pipeline) => ({
			exec: async () =>
				pipeline.some((stage) => stage.$facet)
					? [{ list: [], metaCounter: [] }]
					: [{ _id: bookingId, memberId, bookingStatus: 'CANCELLED', totalPrice: 500 }],
		}));
	});
	const run = (source: string, variableValues: Record<string, unknown>, signedIn = true) =>
		graphql({
			schema: app.get(GraphQLSchemaHost).schema,
			source,
			variableValues,
			contextValue: { req: { headers: signedIn ? { authorization: 'Bearer valid' } : {} } },
		});
	const detail = (id = String(bookingId), signedIn = true) =>
		run('query($id:String!){getBooking(bookingId:$id){_id memberId bookingStatus totalPrice}}', { id }, signedIn);
	it('restricts the owner dashboard to the signed-in owner and returns zeros for an empty account', async () => {
		const query = 'query{getOwnerDashboard{totalHotels totalRooms totalBookings totalRevenue currency}}';
		expect((await run(query, {}, false)).errors).toBeDefined();
		for (const memberType of ['USER', 'ADMIN']) {
			auth.verifyToken.mockResolvedValue({ _id: memberId, memberType });
			expect((await run(query, {})).errors).toBeDefined();
		}
		expect(hotels.getOwnerInventoryCounts).not.toHaveBeenCalled();
		expect(storage.aggregate).not.toHaveBeenCalled();
		auth.verifyToken.mockResolvedValue({ _id: memberId, memberType: 'HOTEL_OWNER' });
		hotels.getOwnerInventoryCounts.mockResolvedValue({ totalHotels: 0, totalRooms: 0 });
		storage.aggregate.mockReturnValue({ exec: async () => [] });
		const result = await run(query, {});
		expect(result.errors).toBeUndefined();
		expect(result.data?.getOwnerDashboard).toEqual({
			totalHotels: 0,
			totalRooms: 0,
			totalBookings: 0,
			totalRevenue: 0,
			currency: 'USD',
		});
		expect(hotels.getOwnerInventoryCounts).toHaveBeenCalledWith(memberId);
		expect((await run('query{getOwnerDashboard(ownerId:"other"){totalHotels}}', {})).errors).toBeDefined();
	});
	it.each(['confirmBooking', 'cancelBooking', 'completeBooking'] as const)(
		'%s validates identity, role and ObjectId before calling the service',
		async (action) => {
			const spy = jest.spyOn(app.get(BookingService), action).mockResolvedValue({ _id: bookingId } as any);
			const mutation = (id = String(bookingId), signedIn = true) =>
				run(`mutation($id:String!){${action}(bookingId:$id){_id}}`, { id }, signedIn);
			try {
				expect((await mutation(undefined, false)).errors).toBeDefined();
				if (action !== 'cancelBooking') {
					expect((await mutation()).errors).toBeDefined();
					auth.verifyToken.mockResolvedValue({ _id: memberId, memberType: 'ADMIN' });
					expect((await mutation()).errors).toBeDefined();
				}
				auth.verifyToken.mockResolvedValue({ _id: memberId, memberType: 'HOTEL_OWNER' });
				expect((await mutation('invalid')).errors).toBeDefined();
				expect(spy).not.toHaveBeenCalled();
				expect((await mutation()).errors).toBeUndefined();
				expect(spy).toHaveBeenCalledWith(
					...(action === 'cancelBooking' ? [memberId, 'HOTEL_OWNER', bookingId] : [memberId, bookingId]),
				);
			} finally {
				spy.mockRestore();
			}
		},
	);
	const list = (input: unknown = {}, signedIn = true) =>
		run(
			'query($input:BookingsInquiry!){getMyBookings(input:$input){list{_id} metaCounter{total}}}',
			{ input },
			signedIn,
		);
	const creationInput = () => ({
		roomId: String(new Types.ObjectId()),
		requestId: 'ed109ecc-8146-4eee-8a64-70d2d6d1f41b',
		checkIn: '2035-09-10',
		checkOut: '2035-09-13',
		guests: 2,
		rooms: 1,
	});
	const create = (input: unknown = creationInput(), signedIn = true) =>
		run(
			'mutation($input:BookingInput!){createBooking(input:$input){_id currency totalPrice expiresAt}}',
			{ input },
			signedIn,
		);
	it('requires authentication for booking creation', async () => {
		expect((await create(undefined, false)).errors).toBeDefined();
		expect(storage.findOne).not.toHaveBeenCalled();
	});
	it.each([
		{ requestId: 'invalid' },
		{ rooms: 0 },
		{ guests: 1.5 },
		{ totalPrice: 1 },
		{ memberId: String(memberId) },
		{ currency: 'KRW' },
	])('rejects invalid or forged booking creation input %j', async (change) => {
		expect((await create({ ...creationInput(), ...change })).errors).toBeDefined();
		expect(storage.findOne).not.toHaveBeenCalled();
	});
	it('passes the authenticated identity to booking creation and exposes USD fields', async () => {
		const input = creationInput();
		const service = app.get(BookingService);
		const spy = jest.spyOn(service, 'createBooking').mockResolvedValue({
			_id: bookingId,
			currency: 'USD',
			totalPrice: 59.97,
			expiresAt: new Date('2035-09-01T00:15:00Z'),
		} as any);
		try {
			const result = await create(input);
			expect(result.errors).toBeUndefined();
			expect(result.data?.createBooking).toMatchObject({ currency: 'USD', totalPrice: 59.97 });
			expect(spy).toHaveBeenCalledWith(memberId, expect.objectContaining(input));
		} finally {
			spy.mockRestore();
		}
	});
	it('requires authentication for both queries', async () => {
		expect((await detail(undefined, false)).errors).toBeDefined();
		expect((await list({}, false)).errors).toBeDefined();
		expect(storage.findOne).not.toHaveBeenCalled();
		expect(storage.aggregate).not.toHaveBeenCalled();
	});
	it('rejects invalid sessions before database queries', async () => {
		auth.verifyToken.mockRejectedValue(new UnauthorizedException());
		expect((await detail()).errors).toBeDefined();
		expect((await list()).errors).toBeDefined();
		expect(storage.findOne).not.toHaveBeenCalled();
		expect(storage.aggregate).not.toHaveBeenCalled();
	});
	it.each(['USER', 'HOTEL_OWNER', 'ADMIN'])('scopes %s detail access to their own booking', async (memberType) => {
		auth.verifyToken.mockResolvedValue({ _id: memberId, memberType });
		const result = await detail();
		expect(result.errors).toBeUndefined();
		expect(result.data?.getBooking).toMatchObject({
			memberId: String(memberId),
			bookingStatus: 'CANCELLED',
			totalPrice: 500,
		});
		expect(storage.aggregate.mock.calls[0][0][0]).toEqual({ $match: { _id: bookingId, memberId } });
	});
	it('hides a booking belonging to someone else', async () => {
		storage.aggregate.mockReturnValue({ exec: async () => [] });
		expect(((await detail()).errors?.[0].originalError as any).getStatus()).toBe(404);
	});
	it('rejects invalid IDs before database access', async () => {
		expect((await detail('invalid')).errors).toBeDefined();
		expect(storage.aggregate).not.toHaveBeenCalled();
	});
	it('uses default pagination and scopes list and total to the authenticated member', async () => {
		expect((await list()).errors).toBeUndefined();
		const pipeline = storage.aggregate.mock.calls[0][0];
		expect(pipeline[0]).toEqual({ $match: { memberId } });
		expect(pipeline[1]).toEqual({ $sort: { createdAt: -1, _id: -1 } });
		expect(pipeline[2].$facet.list.slice(0, 2)).toEqual([{ $skip: 0 }, { $limit: 20 }]);
		expect(pipeline[2].$facet.metaCounter).toEqual([{ $count: 'total' }]);
	});
	it.each(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])(
		'filters %s bookings before pagination',
		async (bookingStatus) => {
			expect((await list({ bookingStatus, page: 3, limit: 5 })).errors).toBeUndefined();
			const pipeline = storage.aggregate.mock.calls[0][0];
			expect(pipeline[0].$match).toEqual({ memberId, bookingStatus });
			expect(pipeline[2].$facet.list.slice(0, 2)).toEqual([{ $skip: 10 }, { $limit: 5 }]);
		},
	);
	it.each([
		{ page: 0 },
		{ limit: 101 },
		{ bookingStatus: null },
		{ bookingStatus: 'INVALID' },
		{ memberId: String(new Types.ObjectId()) },
	])('rejects invalid or forged inquiry %j', async (input) => {
		expect((await list(input)).errors).toBeDefined();
		expect(storage.aggregate).not.toHaveBeenCalled();
	});
	it('propagates database errors from detail and list', async () => {
		const error = new Error('database unavailable');
		storage.findOne.mockReturnValue({
			lean: () => ({
				exec: async () => {
					throw error;
				},
			}),
		});
		storage.aggregate.mockReturnValue({
			exec: async () => {
				throw error;
			},
		});
		expect((await detail()).errors?.[0].originalError).toBe(error);
		expect((await list()).errors?.[0].originalError).toBe(error);
	});
	const ownerList = (input: unknown = {}, signedIn = true) =>
		run(
			'query($input:OwnerBookingsInquiry!){getOwnerBookings(input:$input){list{_id} metaCounter{total}}}',
			{ input },
			signedIn,
		);
	const ownerDetail = (id = String(bookingId), signedIn = true) =>
		run('query($id:String!){getOwnerBooking(bookingId:$id){_id}}', { id }, signedIn);
	it('requires the owner role for both owner queries', async () => {
		expect((await ownerList({}, false)).errors).toBeDefined();
		expect((await ownerDetail(undefined, false)).errors).toBeDefined();
		for (const memberType of ['USER', 'ADMIN']) {
			auth.verifyToken.mockResolvedValue({ _id: memberId, memberType });
			expect((await ownerList()).errors).toBeDefined();
			expect((await ownerDetail()).errors).toBeDefined();
		}
		expect(storage.aggregate).not.toHaveBeenCalled();
	});
	it('validates owner filters and IDs before querying storage', async () => {
		auth.verifyToken.mockResolvedValue({ _id: memberId, memberType: 'HOTEL_OWNER' });
		for (const input of [
			{ hotelId: 'bad' },
			{ hotelId: null },
			{ ownerId: String(memberId) },
			{ page: 0 },
			{ limit: 101 },
			{ bookingStatus: 'bad' },
			{ checkIn: null },
			{ checkIn: '2035-09-10' },
			{ checkIn: '2035-02-30', checkOut: '2035-03-01' },
			{ checkIn: '2035-09-12', checkOut: '2035-09-10' },
		])
			expect((await ownerList(input)).errors).toBeDefined();
		expect((await ownerDetail('bad')).errors).toBeDefined();
		expect(storage.aggregate).not.toHaveBeenCalled();
	});
	it('uses the authenticated owner in the ownership lookup before counting and pagination', async () => {
		auth.verifyToken.mockResolvedValue({ _id: memberId, memberType: 'HOTEL_OWNER' });
		expect((await ownerList()).errors).toBeUndefined();
		const pipeline = storage.aggregate.mock.calls[0][0];
		expect(pipeline[1].$lookup.pipeline[0]).toEqual({ $match: { ownerId: memberId } });
		expect(pipeline[2]).toEqual({ $match: { 'ownedHotel.0': { $exists: true } } });
		expect(pipeline.findIndex((stage) => stage.$facet)).toBeGreaterThan(2);
		expect((await ownerDetail()).errors).toBeUndefined();
	});
	it('exposes nullable booking relation fields but rejects sensitive member fields', async () => {
		const query =
			'query($id:String!){getBooking(bookingId:$id){hotelData{hotelName} roomData{roomName} memberData{memberNick}}}';
		const result = await run(query, { id: String(bookingId) });
		expect(result.errors).toBeUndefined();
		expect(result.data?.getBooking).toEqual({ hotelData: null, roomData: null, memberData: null });
		for (const field of ['memberPassword', 'memberEmail', 'memberPhone', 'accessToken']) {
			expect(
				(await run(`query($id:String!){getBooking(bookingId:$id){memberData{${field}}}}`, { id: String(bookingId) }))
					.errors,
			).toBeDefined();
		}
	});
});
