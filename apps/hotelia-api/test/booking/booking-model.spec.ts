import { model, Types } from 'mongoose';
import BookingSchema from '../../src/schemas/Booking.model';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BookingInput } from '../../src/libs/dto/booking/booking.input';
const BookingModel = model('BookingValidationTest', BookingSchema);
const valid = () => ({
	memberId: new Types.ObjectId(),
	hotelId: new Types.ObjectId(),
	roomId: new Types.ObjectId(),
	checkIn: new Date('2030-09-10'),
	checkOut: new Date('2030-09-15'),
	guests: 2,
	rooms: 1,
	nights: 5,
	pricePerNight: 100,
	totalPrice: 500,
});
describe('Booking schema and input', () => {
	it('defaults to PENDING and accepts a valid snapshot', () => {
		const booking = new BookingModel(valid());
		expect(booking.validateSync()).toBeUndefined();
		expect(booking.bookingStatus).toBe('PENDING');
	});
	it.each([
		{ rooms: 0 },
		{ guests: 1.5 },
		{ nights: 4 },
		{ pricePerNight: -1 },
		{ bookingStatus: 'INVALID' },
		{ checkOut: new Date('2030-09-09') },
		{ checkIn: new Date('2030-09-10T12:00:00Z') },
	])('rejects invalid snapshot %j', (change) => {
		expect(new BookingModel({ ...valid(), ...change }).validateSync()).toBeDefined();
	});
	it('does not accept prices or member identity from the client', async () => {
		const input = plainToInstance(BookingInput, {
			roomId: String(new Types.ObjectId()),
			checkIn: '2030-09-10',
			checkOut: '2030-09-15',
			guests: 2,
			memberId: String(new Types.ObjectId()),
			totalPrice: 1,
			nights: 1,
		});
		const errors = await validate(input, { whitelist: true, forbidNonWhitelisted: true });
		expect(errors.map((error) => error.property).sort()).toEqual(['memberId', 'nights', 'totalPrice']);
	});
});
