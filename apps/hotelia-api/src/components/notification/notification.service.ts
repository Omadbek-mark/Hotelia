import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Hotel } from '../../libs/dto/hotel/hotel';
import { Notification, Notifications, NotificationsInquiry } from '../../libs/dto/notification/notification';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../libs/enums/notification.enum';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class NotificationService {
	constructor(
		@InjectModel('Notification') private readonly notificationModel: Model<Notification>,
		@InjectModel('Hotel') private readonly hotelModel: Model<Hotel>,
	) {}

	// Internal API only. Call within the transaction that changes the booking/review.
	async notify(
		type: NotificationType,
		authorId: Types.ObjectId,
		booking: { _id: Types.ObjectId; hotelId: Types.ObjectId; memberId: Types.ObjectId },
		session: ClientSession,
	): Promise<void> {
		const hotel = await this.hotelModel.findById(booking.hotelId).session(session).lean().exec();
		if (!hotel) throw new NotFoundException(Message.NO_DATA_FOUND);
		const recipients =
			type === NotificationType.BOOKING_CANCELLED
				? [booking.memberId, hotel.ownerId]
				: type === NotificationType.BOOKING_CONFIRMED
					? [booking.memberId]
					: [hotel.ownerId];
		const titles: Partial<Record<NotificationType, string>> = {
			[NotificationType.BOOKING_CREATED]: 'New booking',
			[NotificationType.BOOKING_CONFIRMED]: 'Booking confirmed',
			[NotificationType.BOOKING_CANCELLED]: 'Booking cancelled',
			[NotificationType.REVIEW]: 'New hotel review',
		};
		const receivers = [...new Set(recipients.map(String))].filter((id) => id !== String(authorId));
		if (!receivers.length) return;
		await this.notificationModel.create(
			receivers.map((receiverId) => ({
				authorId,
				receiverId,
				hotelId: booking.hotelId,
				bookingId: booking._id,
				notificationType: type,
				notificationStatus: NotificationStatus.WAIT,
				notificationGroup: type === NotificationType.REVIEW ? NotificationGroup.HOTEL : NotificationGroup.BOOKING,
				notificationTitle: titles[type],
			})),
			{ session, ordered: true },
		);
	}

	async getMyNotifications(receiverId: Types.ObjectId, input: NotificationsInquiry): Promise<Notifications> {
		const [result] = await this.notificationModel
			.aggregate<Notifications>([
				{
					$match: { receiverId, ...(input.notificationStatus ? { notificationStatus: input.notificationStatus } : {}) },
				},
				{ $sort: { createdAt: -1, _id: -1 } },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		return result ?? { list: [], metaCounter: [] };
	}

	async getUnreadNotificationCount(receiverId: Types.ObjectId): Promise<number> {
		return this.notificationModel.countDocuments({ receiverId, notificationStatus: NotificationStatus.WAIT }).exec();
	}

	async markNotificationRead(receiverId: Types.ObjectId, _id: Types.ObjectId): Promise<Notification> {
		const result = await this.notificationModel
			.findOneAndUpdate(
				{ _id, receiverId },
				{ $set: { notificationStatus: NotificationStatus.READ } },
				{ new: true, runValidators: true },
			)
			.exec();
		if (!result) throw new NotFoundException(Message.NO_DATA_FOUND);
		return result;
	}
}
