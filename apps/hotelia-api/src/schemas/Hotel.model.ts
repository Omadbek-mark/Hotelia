import { Schema } from 'mongoose';
import { isTimeZone } from 'class-validator';
import { HotelAmenity, HotelStatus, HotelType } from '../libs/enums/hotel.enum';

const HotelSchema = new Schema(
	{
		bookingVersion: { type: Number, default: 0, select: false },
		ownerId: {
			type: Schema.Types.ObjectId,
			ref: 'Member',
			required: true,
			immutable: true,
		},

		hotelName: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			maxlength: 100,
		},

		hotelDescription: {
			type: String,
			required: true,
			trim: true,
			minlength: 10,
			maxlength: 5000,
		},

		hotelCountry: {
			type: String,
			required: true,
			trim: true,
			minlength: 2,
			maxlength: 100,
		},

		hotelCity: {
			type: String,
			required: true,
			trim: true,
			minlength: 2,
			maxlength: 100,
		},

		hotelAddress: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			maxlength: 300,
		},

		hotelTimezone: {
			type: String,
			required: true,
			validate: isTimeZone,
		},

		hotelType: {
			type: String,
			enum: HotelType,
			required: true,
		},

		hotelStatus: {
			type: String,
			enum: HotelStatus,
			required: true,
			default: HotelStatus.ACTIVE,
		},

		hotelImages: {
			type: [{ type: String, required: true, trim: true, minlength: 1, maxlength: 2048 }],
			required: true,
			validate: (images: string[]) =>
				images.length >= 1 && images.length <= 20 && new Set(images).size === images.length,
		},
		hotelAmenities: {
			type: [{ type: String, enum: HotelAmenity }],
			default: [],
			required: true,
			validate: (values: string[]) => values.length <= 8 && new Set(values).size === values.length,
		},
		hotelRating: {
			type: Number,
			default: 0,
			min: 0,
			max: 5,
			required: true,
		},

		hotelReviews: {
			type: Number,
			default: 0,
			min: 0,
			validate: Number.isInteger,
			required: true,
		},

		hotelViews: {
			type: Number,
			default: 0,
			min: 0,
			validate: Number.isInteger,
			required: true,
		},

		hotelLikes: {
			type: Number,
			default: 0,
			min: 0,
			validate: Number.isInteger,
			required: true,
		},

		deletedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'hotels' },
);

HotelSchema.index({ ownerId: 1, hotelStatus: 1 });
HotelSchema.index({ hotelStatus: 1, createdAt: -1, _id: -1 });
HotelSchema.index({ hotelCountry: 1, hotelCity: 1, hotelStatus: 1 });
// Hotel names are not globally unique; separate hotels can share a name.
export default HotelSchema;
