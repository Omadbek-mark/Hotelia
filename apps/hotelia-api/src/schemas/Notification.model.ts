import { Schema } from 'mongoose';
import { NotificationGroup, NotificationStatus, NotificationType } from '../libs/enums/notification.enum';

const NotificationSchema = new Schema(
	{
		notificationType: {
			type: String,
			enum: NotificationType,
			required: true,
		},

		notificationStatus: {
			type: String,
			enum: NotificationStatus,
			default: NotificationStatus.WAIT,
		},

		notificationGroup: {
			type: String,
			enum: NotificationGroup,
			required: true,
		},

		notificationTitle: {
			type: String,
			required: true,
		},

		notificationDesc: {
			type: String,
		},

		authorId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		receiverId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		hotelId: {
			type: Schema.Types.ObjectId,
			ref: 'Hotel',
		},

		bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
		roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
		inquiryId: { type: Schema.Types.ObjectId, ref: 'Notice' },

		articleId: {
			type: Schema.Types.ObjectId,
			ref: 'BoardArticle',
		},
	},
	{ timestamps: true, collection: 'notifications' },
);

NotificationSchema.index({ receiverId: 1, createdAt: -1, _id: -1 });
NotificationSchema.index({ receiverId: 1, notificationStatus: 1, createdAt: -1, _id: -1 });
NotificationSchema.index(
	{ receiverId: 1, notificationType: 1, inquiryId: 1 },
	{ unique: true, partialFilterExpression: { inquiryId: { $type: 'objectId' } } },
);

export default NotificationSchema;
