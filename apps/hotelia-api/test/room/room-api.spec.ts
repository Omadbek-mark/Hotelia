import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule, GraphQLSchemaHost } from '@nestjs/graphql';
import { graphql } from 'graphql';
import { Error as MongooseError, Types } from 'mongoose';
import { RoomService } from '../../src/components/room/room.service';
import { RoomResolver } from '../../src/components/room/room.resolver';
import { HotelService } from '../../src/components/hotel/hotel.service';
import { AuthService } from '../../src/components/auth/auth.service';

const hotelId = new Types.ObjectId();
const roomId = new Types.ObjectId();
const memberId = new Types.ObjectId();
const validInput = () => ({
	hotelId: String(hotelId),
	roomName: 'Deluxe Room',
	roomDescription: 'A spacious room with a city view.',
	roomType: 'DELUXE',
	roomPrice: 120,
	roomCapacity: 2,
	roomQuantity: 5,
	bedType: 'QUEEN',
	roomSize: 30,
	roomImages: ['room.jpg'],
	roomAmenities: ['WIFI'],
});

describe('Room GraphQL API', () => {
	let app: INestApplication;
	const storage = { create: jest.fn(), findOne: jest.fn(), aggregate: jest.fn(), findOneAndUpdate: jest.fn() };
	const hotels = { getOwnerHotel: jest.fn(), getHotel: jest.fn() };
	const auth = { verifyToken: jest.fn() };
	beforeAll(async () => {
		const module = await Test.createTestingModule({
			imports: [GraphQLModule.forRoot({ driver: ApolloDriver, autoSchemaFile: true })],
			providers: [
				RoomService,
				RoomResolver,
				{ provide: getModelToken('Room'), useValue: storage },
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
		auth.verifyToken.mockResolvedValue({ _id: memberId, memberType: 'HOTEL_OWNER' });
		hotels.getOwnerHotel.mockResolvedValue({ _id: hotelId });
		hotels.getHotel.mockResolvedValue({ _id: hotelId });
		storage.create.mockImplementation(async (input) => ({ _id: roomId, ...input }));
		storage.aggregate.mockReturnValue({ exec: async () => [{ list: [], metaCounter: [] }] });
		storage.findOne.mockReturnValue({
			lean: () => ({ exec: async () => ({ _id: roomId, hotelId, roomStatus: 'ACTIVE' }) }),
		});
	});
	const run = (source: string, variableValues: Record<string, unknown>, signedIn = false) =>
		graphql({
			schema: app.get(GraphQLSchemaHost).schema,
			source,
			variableValues,
			contextValue: { req: { headers: signedIn ? { authorization: 'Bearer valid' } : {} } },
		});
	const create = (input: unknown = validInput(), signedIn = true) =>
		run(
			'mutation($input:RoomInput!){createRoom(input:$input){_id hotelId roomName roomStatus roomQuantity}}',
			{ input },
			signedIn,
		);
	const list = (input: unknown = { hotelId: String(hotelId) }) =>
		run('query($input:RoomsInquiry!){getRooms(input:$input){list{_id} metaCounter{total}}}', { input });
	const detail = (id = String(roomId)) => run('query($id:String!){getRoom(roomId:$id){_id roomStatus}}', { id });

	const ownerList = (input: unknown = { hotelId: String(hotelId) }, signedIn = true) =>
		run(
			'query($input:OwnerRoomsInquiry!){getOwnerRooms(input:$input){list{_id} metaCounter{total}}}',
			{ input },
			signedIn,
		);
	const ownerDetail = (id = String(roomId), signedIn = true) =>
		run('query($id:String!){getOwnerRoom(roomId:$id){_id roomStatus}}', { id }, signedIn);
	const update = (input: unknown = { _id: String(roomId), roomPrice: 150 }, signedIn = true) =>
		run('mutation($input:RoomUpdate!){updateRoom(input:$input){_id roomStatus roomPrice}}', { input }, signedIn);
	const remove = (id = String(roomId), signedIn = true) =>
		run('mutation($id:String!){deleteRoom(roomId:$id){_id roomStatus deletedAt}}', { id }, signedIn);

	it.each(['USER', 'ADMIN', 'GUEST'])('denies all owner room operations to %s', async (role) => {
		auth.verifyToken.mockResolvedValue({ _id: memberId, memberType: role });
		const signedIn = role !== 'GUEST';
		for (const result of [
			await ownerList(undefined, signedIn),
			await ownerDetail(undefined, signedIn),
			await update(undefined, signedIn),
			await remove(undefined, signedIn),
		]) {
			expect(result.errors).toBeDefined();
		}
		expect(storage.findOne).not.toHaveBeenCalled();
		expect(storage.findOneAndUpdate).not.toHaveBeenCalled();
		expect(storage.aggregate).not.toHaveBeenCalled();
	});
	it.each([undefined, 'ACTIVE', 'PAUSED'])('lists owned rooms with status %s and pagination', async (roomStatus) => {
		expect((await ownerList({ hotelId: String(hotelId), roomStatus, page: 2, limit: 5 })).errors).toBeUndefined();
		expect(hotels.getOwnerHotel).toHaveBeenCalledWith(memberId, hotelId);
		const pipeline = storage.aggregate.mock.calls[0][0];
		expect(pipeline[0].$match).toEqual({ hotelId, roomStatus: roomStatus ?? { $in: ['ACTIVE', 'PAUSED'] } });
		expect(pipeline[2].$facet.list).toEqual([{ $skip: 5 }, { $limit: 5 }]);
	});
	it('rejects DELETE in owner list', async () => {
		expect((await ownerList({ hotelId: String(hotelId), roomStatus: 'DELETE' })).errors).toBeDefined();
		expect(storage.aggregate).not.toHaveBeenCalled();
	});
	it('checks the hotel owner before returning a room detail', async () => {
		expect((await ownerDetail()).errors).toBeUndefined();
		expect(hotels.getOwnerHotel).toHaveBeenCalledWith(memberId, hotelId);
		expect(storage.findOne).toHaveBeenCalledWith({ _id: roomId, roomStatus: { $in: ['ACTIVE', 'PAUSED'] } });
	});
	it('denies read and write operations when hotel ownership/status check fails', async () => {
		hotels.getOwnerHotel.mockRejectedValue(new NotFoundException());
		for (const result of [await ownerList(), await ownerDetail(), await update(), await remove()])
			expect(result.errors).toBeDefined();
		expect(storage.findOneAndUpdate).not.toHaveBeenCalled();
		expect(storage.aggregate).not.toHaveBeenCalled();
	});
	it.each([
		{ _id: 'invalid' },
		{ _id: String(roomId) },
		{ _id: String(roomId), roomPrice: null },
		{ _id: String(roomId), roomQuantity: 1.5 },
		{ _id: String(roomId), roomStatus: 'DELETE' },
		{ _id: String(roomId), hotelId: String(hotelId) },
		{ _id: String(roomId), roomImages: [] },
	])('rejects invalid room updates %j', async (input) => {
		expect((await update(input)).errors).toBeDefined();
		expect(storage.findOneAndUpdate).not.toHaveBeenCalled();
	});
	it.each(['ACTIVE', 'PAUSED'])('updates allowed fields and status to %s', async (roomStatus) => {
		storage.findOneAndUpdate.mockImplementation((filter, change) => ({
			exec: async () => ({ _id: roomId, roomPrice: 150, ...change.$set }),
		}));
		expect(
			(await update({ _id: String(roomId), roomPrice: 150, roomStatus, roomAmenities: [] })).errors,
		).toBeUndefined();
		expect(storage.findOneAndUpdate).toHaveBeenCalledWith(
			{ _id: roomId, hotelId, roomStatus: { $in: ['ACTIVE', 'PAUSED'] } },
			{ $set: { roomPrice: 150, roomStatus, roomAmenities: [] } },
			{ new: true, runValidators: true },
		);
	});
	it('cannot change parent or timestamps through a direct service update', async () => {
		storage.findOneAndUpdate.mockReturnValue({ exec: async () => ({ _id: roomId }) });
		await app.get(RoomService).updateRoom(memberId, {
			_id: String(roomId),
			roomPrice: 150,
			hotelId: String(new Types.ObjectId()),
			deletedAt: new Date(),
		} as any);
		expect(storage.findOneAndUpdate.mock.calls[0][1]).toEqual({ $set: { roomPrice: 150 } });
	});
	it('soft deletes the room and rejects a repeat deletion', async () => {
		let status = 'ACTIVE';
		storage.findOne.mockImplementation(() => ({
			lean: () => ({ exec: async () => (status === 'DELETE' ? null : { _id: roomId, hotelId, roomStatus: status }) }),
		}));
		storage.findOneAndUpdate.mockImplementation((filter, change) => ({
			exec: async () => {
				expect(filter).toEqual({ _id: roomId, hotelId, roomStatus: { $in: ['ACTIVE', 'PAUSED'] } });
				status = change.$set.roomStatus;
				return { _id: roomId, ...change.$set };
			},
		}));
		const first = await remove();
		expect(first.errors).toBeUndefined();
		expect(first.data?.deleteRoom).toMatchObject({ roomStatus: 'DELETE', deletedAt: expect.any(String) });
		expect((await remove()).errors).toBeDefined();
		expect(storage.findOneAndUpdate).toHaveBeenCalledTimes(1);
	});
	it('rejects writes when a room disappears after the ownership check', async () => {
		storage.findOneAndUpdate.mockReturnValue({ exec: async () => null });
		expect(((await update()).errors?.[0].originalError as any).getStatus()).toBe(404);
		expect(((await remove()).errors?.[0].originalError as any).getStatus()).toBe(404);
	});
	it('maps update validation errors and propagates infrastructure errors', async () => {
		storage.findOneAndUpdate.mockReturnValue({
			exec: async () => {
				throw new MongooseError.ValidationError();
			},
		});
		expect(((await update()).errors?.[0].originalError as any).getStatus()).toBe(400);
		const error = new Error('database unavailable');
		storage.findOneAndUpdate.mockReturnValue({
			exec: async () => {
				throw error;
			},
		});
		expect((await update()).errors?.[0].originalError).toBe(error);
		expect((await remove()).errors?.[0].originalError).toBe(error);
	});
	it('rejects invalid owner detail and deletion IDs before database access', async () => {
		expect((await ownerDetail('invalid')).errors).toBeDefined();
		expect((await remove('invalid')).errors).toBeDefined();
		expect(storage.findOne).not.toHaveBeenCalled();
	});
	it('creates a room after checking the authenticated hotel owner', async () => {
		const result = await create();
		expect(result.errors).toBeUndefined();
		expect(result.data?.createRoom).toMatchObject({ hotelId: String(hotelId), roomStatus: 'ACTIVE', roomQuantity: 5 });
		expect(hotels.getOwnerHotel).toHaveBeenCalledWith(memberId, hotelId);
		expect(storage.create).toHaveBeenCalledWith({ ...validInput(), hotelId, roomStatus: 'ACTIVE' });
		expect(hotels.getOwnerHotel.mock.invocationCallOrder[0]).toBeLessThan(storage.create.mock.invocationCallOrder[0]);
	});
	it.each(['USER', 'ADMIN', 'GUEST'])('rejects creation by %s', async (role) => {
		auth.verifyToken.mockResolvedValue({ _id: memberId, memberType: role });
		expect((await create(validInput(), role !== 'GUEST')).errors).toBeDefined();
		expect(storage.create).not.toHaveBeenCalled();
		expect(hotels.getOwnerHotel).not.toHaveBeenCalled();
	});
	it('does not create a room when the ownership/status check fails', async () => {
		hotels.getOwnerHotel.mockRejectedValue(new NotFoundException());
		expect((await create()).errors).toBeDefined();
		expect(storage.create).not.toHaveBeenCalled();
	});
	it.each([
		{ hotelId: 'invalid' },
		{ roomQuantity: 0 },
		{ roomCapacity: 1.5 },
		{ roomPrice: -1 },
		{ roomStatus: 'DELETE' },
	])('rejects invalid creation input %j', async (change) => {
		expect((await create({ ...validInput(), ...change })).errors).toBeDefined();
		expect(storage.create).not.toHaveBeenCalled();
		expect(hotels.getOwnerHotel).not.toHaveBeenCalled();
	});
	it('uses an explicit allowlist even on direct service calls', async () => {
		await app
			.get(RoomService)
			.createRoom(memberId, { ...validInput(), roomStatus: 'DELETE', deletedAt: new Date(), ownerId: memberId } as any);
		expect(storage.create.mock.calls[0][0]).toEqual({ ...validInput(), hotelId, roomStatus: 'ACTIVE' });
	});
	it('maps schema validation errors to bad request', async () => {
		storage.create.mockRejectedValue(new MongooseError.ValidationError());
		expect(((await create()).errors?.[0].originalError as any).getStatus()).toBe(400);
	});
	it('propagates infrastructure errors from creation', async () => {
		const error = new Error('database unavailable');
		storage.create.mockRejectedValue(error);
		expect((await create()).errors?.[0].originalError).toBe(error);
	});
	it('returns a public list with default pagination and no view tracking', async () => {
		expect((await list()).errors).toBeUndefined();
		expect(auth.verifyToken).not.toHaveBeenCalled();
		expect(hotels.getHotel).toHaveBeenCalledWith(hotelId);
		const pipeline = storage.aggregate.mock.calls[0][0];
		expect(pipeline[0].$match).toEqual({ hotelId, roomStatus: 'ACTIVE' });
		expect(pipeline[1].$sort).toEqual({ createdAt: -1, _id: -1 });
		expect(pipeline[2].$facet).toEqual({ list: [{ $skip: 0 }, { $limit: 20 }], metaCounter: [{ $count: 'total' }] });
	});
	it.each(['PRICE_ASC', 'PRICE_DESC'])('supports room type and %s sorting', async (sort) => {
		expect(
			(await list({ hotelId: String(hotelId), page: 2, limit: 5, roomType: 'SUITE', sort })).errors,
		).toBeUndefined();
		const pipeline = storage.aggregate.mock.calls[0][0];
		expect(pipeline[0].$match.roomType).toBe('SUITE');
		expect(pipeline[1].$sort.roomPrice).toBe(sort === 'PRICE_ASC' ? 1 : -1);
		expect(pipeline[2].$facet.list).toEqual([{ $skip: 5 }, { $limit: 5 }]);
	});
	it.each([{ hotelId: 'invalid' }, { page: 0 }, { limit: 101 }, { sort: 'INVALID' }, { roomType: null }])(
		'rejects invalid list input %j',
		async (change) => {
			expect((await list({ hotelId: String(hotelId), ...change })).errors).toBeDefined();
			expect(storage.aggregate).not.toHaveBeenCalled();
		},
	);
	it('does not list rooms when the public hotel visibility check fails', async () => {
		hotels.getHotel.mockRejectedValue(new NotFoundException());
		expect((await list()).errors).toBeDefined();
		expect(storage.aggregate).not.toHaveBeenCalled();
	});
	it('returns active room detail only after checking its hotel visibility', async () => {
		expect((await detail()).errors).toBeUndefined();
		expect(storage.findOne).toHaveBeenCalledWith({ _id: roomId, roomStatus: 'ACTIVE' });
		expect(hotels.getHotel).toHaveBeenCalledWith(hotelId);
	});
	it('hides room detail when its hotel is unavailable', async () => {
		hotels.getHotel.mockRejectedValue(new NotFoundException());
		expect((await detail()).errors).toBeDefined();
	});
	it('returns not-found for missing or inactive rooms', async () => {
		storage.findOne.mockReturnValue({ lean: () => ({ exec: async () => null }) });
		expect(((await detail()).errors?.[0].originalError as any).getStatus()).toBe(404);
		expect(hotels.getHotel).not.toHaveBeenCalled();
	});
	it('rejects invalid room IDs before database access', async () => {
		expect((await detail('invalid')).errors).toBeDefined();
		expect(storage.findOne).not.toHaveBeenCalled();
	});
	it('propagates list database failures', async () => {
		const error = new Error('database unavailable');
		storage.aggregate.mockReturnValue({
			exec: async () => {
				throw error;
			},
		});
		expect((await list()).errors?.[0].originalError).toBe(error);
	});
});
