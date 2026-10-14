import { BOOKING_CURRENCY, isUsdAmount } from '../libs/booking/money';
import { Schema } from 'mongoose';
import { BookingStatus } from '../libs/enums/booking.enum';
import { PaymentMethod, PaymentStatus } from '../libs/enums/payment.enum';
import { DAY_MS } from '../libs/booking/stay-dates';

const BookingSchema = new Schema(
	{
		paymentMethod: { type: String, enum: PaymentMethod, immutable: true },
		paymentStatus: { type: String, enum: PaymentStatus, immutable: true },
		requestId: { type: String, immutable: true, lowercase: true },
		currency: { type: String, enum: [BOOKING_CURRENCY], default: BOOKING_CURRENCY, required: true, immutable: true },
		expiresAt: { type: Date },
		freeCancellationUntil: { type: Date, immutable: true },
		cancellationFeeRate: { type: Number, enum: [0, 0.05], default: 0, immutable: true },
		cancellationFee: { type: Number, min: 0 },
		refundAmount: { type: Number, min: 0 },
		cancelledAt: { type: Date },
		cancelledBy: { type: Schema.Types.ObjectId, ref: 'Member' },
		confirmedAt: { type: Date },
		confirmedAutomatically: { type: Boolean, default: false },
		memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true, immutable: true },
		hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true, immutable: true },
		roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, immutable: true },
		checkIn: {
			type: Date,
			required: true,
			immutable: true,
			validate: (value: Date) =>
				Number.isFinite(value.getTime()) &&
				value.getUTCHours() === 0 &&
				value.getUTCMinutes() === 0 &&
				value.getUTCSeconds() === 0 &&
				value.getUTCMilliseconds() === 0,
		},
		checkOut: {
			type: Date,
			required: true,
			immutable: true,
			validate: (value: Date) =>
				Number.isFinite(value.getTime()) &&
				value.getUTCHours() === 0 &&
				value.getUTCMinutes() === 0 &&
				value.getUTCSeconds() === 0 &&
				value.getUTCMilliseconds() === 0,
		},
		guests: { type: Number, required: true, immutable: true, min: 1, max: 2147483647, validate: Number.isInteger },
		rooms: { type: Number, required: true, immutable: true, min: 1, max: 2147483647, validate: Number.isInteger },
		nights: { type: Number, required: true, immutable: true, min: 1, max: 365, validate: Number.isInteger },
		pricePerNight: {
			type: Number,
			required: true,
			immutable: true,
			min: 0.01,
			max: Number.MAX_SAFE_INTEGER / 100,
			validate: isUsdAmount,
		},
		totalPrice: {
			type: Number,
			required: true,
			immutable: true,
			min: 0.01,
			max: Number.MAX_SAFE_INTEGER / 100,
			validate: isUsdAmount,
		},
		bookingStatus: { type: String, enum: BookingStatus, required: true, default: BookingStatus.PENDING },
	},
	{ timestamps: true, collection: 'bookings' },
);

BookingSchema.path('checkOut').validate(function (value: Date) {
	return !this.checkIn || value > this.checkIn;
}, 'Check-out must be after check-in');
BookingSchema.path('nights').validate(function (value: number) {
	return !this.checkIn || !this.checkOut || value === (this.checkOut.getTime() - this.checkIn.getTime()) / DAY_MS;
}, 'Nights must match the stay dates');

BookingSchema.index({ roomId: 1, bookingStatus: 1, checkIn: 1, checkOut: 1 });
BookingSchema.index({ memberId: 1, createdAt: -1 });
BookingSchema.index({ hotelId: 1, createdAt: -1 });
BookingSchema.index({ bookingStatus: 1, freeCancellationUntil: 1 });
BookingSchema.index({ bookingStatus: 1, expiresAt: 1 });
BookingSchema.index(
	{ memberId: 1, requestId: 1 },
	{ unique: true, partialFilterExpression: { requestId: { $type: 'string' } } },
);
export default BookingSchema;
