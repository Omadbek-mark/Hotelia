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
	beforeAll(async () => {
		const module = await Test.createTestingModule({
			imports: [GraphQLModule.forRoot({ driver: ApolloDriver, autoSchemaFile: true })],
			providers: [
				BookingService,
				BookingResolver,
				{ provide: getModelToken('Booking'), useValue: storage },
				{ provide: getModelToken('Room'), useValue: {} },
				{ provide: getConnectionToken(), useValue: {} },
				{ provide: HotelService, useValue: {} },
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
		storage.aggregate.mockReturnValue({ exec: async () => [{ list: [], metaCounter: [] }] });
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
		expect(storage.findOne).toHaveBeenCalledWith({ _id: bookingId, memberId });
	});
	it('hides a booking belonging to someone else', async () => {
		const otherId = new Types.ObjectId();
		storage.findOne.mockImplementation((filter) => ({
			lean: () => ({ exec: async () => (filter.memberId.equals(otherId) ? { _id: bookingId } : null) }),
		}));
		expect(((await detail()).errors?.[0].originalError as any).getStatus()).toBe(404);
	});
	it('rejects invalid IDs before database access', async () => {
		expect((await detail('invalid')).errors).toBeDefined();
		expect(storage.findOne).not.toHaveBeenCalled();
	});
	it('uses default pagination and scopes list and total to the authenticated member', async () => {
		expect((await list()).errors).toBeUndefined();
		expect(storage.aggregate.mock.calls[0][0]).toEqual([
			{ $match: { memberId } },
			{ $sort: { createdAt: -1, _id: -1 } },
			{ $facet: { list: [{ $skip: 0 }, { $limit: 20 }], metaCounter: [{ $count: 'total' }] } },
		]);
	});
	it.each(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])(
		'filters %s bookings before pagination',
		async (bookingStatus) => {
			expect((await list({ bookingStatus, page: 3, limit: 5 })).errors).toBeUndefined();
			const pipeline = storage.aggregate.mock.calls[0][0];
			expect(pipeline[0].$match).toEqual({ memberId, bookingStatus });
			expect(pipeline[2].$facet.list).toEqual([{ $skip: 10 }, { $limit: 5 }]);
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
});
