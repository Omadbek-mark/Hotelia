import { isUsdAmount } from '../libs/booking/money';
import { Schema } from 'mongoose';
import { BedType, RoomAmenity, RoomStatus, RoomType } from '../libs/enums/room.enum';

const RoomSchema = new Schema(
	{
		bookingVersion: { type: Number, default: 0, select: false },
		hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true, immutable: true },
		roomName: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			maxlength: 100,
		},
		roomDescription: {
			type: String,
			required: true,
			trim: true,
			minlength: 10,
			maxlength: 5000,
		},
		roomType: {
			type: String,
			enum: RoomType,
			required: true,
		},
		roomPrice: {
			type: Number,
			required: true,
			min: 0.01,
			max: Number.MAX_SAFE_INTEGER / 100,
			validate: isUsdAmount,
		},
		roomCapacity: {
			type: Number,
			required: true,
			min: 1,
			max: 2147483647,
			validate: Number.isInteger,
		},
		roomQuantity: {
			type: Number,
			required: true,
			min: 1,
			max: 2147483647,
			validate: Number.isInteger,
		},
		bedType: {
			type: String,
			enum: BedType,
			required: true,
		},
		roomSize: {
			type: Number,
			required: true,
			min: 0.01,
			validate: Number.isFinite,
		},
		roomImages: {
			type: [{ type: String, required: true, trim: true, minlength: 1, maxlength: 2048 }],
			required: true,
			validate: (images: string[]) =>
				images.length >= 1 && images.length <= 20 && new Set(images).size === images.length,
		},
		roomAmenities: {
			type: [{ type: String, enum: RoomAmenity }],
			required: true,
			default: [],
			validate: (values: string[]) => values.length <= 7 && new Set(values).size === values.length,
		},
		roomStatus: { type: String, enum: RoomStatus, required: true, default: RoomStatus.ACTIVE },
		deletedAt: { type: Date },
	},
	{ timestamps: true, collection: 'rooms' },
);

RoomSchema.index({ hotelId: 1, roomStatus: 1, roomPrice: 1 });
export default RoomSchema;
