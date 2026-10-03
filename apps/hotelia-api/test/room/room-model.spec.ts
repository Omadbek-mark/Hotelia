import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { model, Types } from 'mongoose';
import RoomSchema from '../../src/schemas/Room.model';
import { RoomInput } from '../../src/libs/dto/room/room.input';

const RoomModel = model('RoomValidationTest', RoomSchema);
const valid = () => ({
	hotelId: String(new Types.ObjectId()),
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

describe('Room data contract', () => {
	it('accepts valid input and defaults status to ACTIVE', async () => {
		expect(await validate(plainToInstance(RoomInput, valid()))).toHaveLength(0);
		const room = new RoomModel(valid());
		expect(room.validateSync()).toBeUndefined();
		expect(room.roomStatus).toBe('ACTIVE');
		expect(room.hotelId).toBeInstanceOf(Types.ObjectId);
	});
	it.each([
		{ roomCapacity: 0 },
		{ roomCapacity: 1.5 },
		{ roomQuantity: 0 },
		{ roomQuantity: 2.5 },
		{ roomPrice: -1 },
		{ roomPrice: Infinity },
		{ roomSize: 0 },
		{ roomImages: [] },
		{ roomImages: ['same', 'same'] },
		{ roomAmenities: ['WIFI', 'WIFI'] },
		{ roomType: 'INVALID' },
		{ hotelId: 'invalid' },
		{ roomName: null },
	])('rejects invalid data in both DTO and schema: %j', async (change) => {
		const input = { ...valid(), ...change };
		expect((await validate(plainToInstance(RoomInput, input))).length).toBeGreaterThan(0);
		expect(new RoomModel(input).validateSync()).toBeDefined();
	});
	it('trims images before duplicate validation', async () => {
		const input = plainToInstance(RoomInput, { ...valid(), roomImages: ['room.jpg', ' room.jpg '] });
		expect((await validate(input)).length).toBeGreaterThan(0);
	});
	it('rejects client-supplied owner and status fields under the resolver validation policy', async () => {
		const input = plainToInstance(RoomInput, {
			...valid(),
			ownerId: String(new Types.ObjectId()),
			roomStatus: 'DELETE',
		});
		const errors = await validate(input, { whitelist: true, forbidNonWhitelisted: true });
		expect(errors.map((error) => error.property).sort()).toEqual(['ownerId', 'roomStatus']);
	});
});
