import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Hotel } from '../../libs/dto/hotel/hotel';
import {
	Notification,
	Notifications,
	NotificationsInquiry,
	UnreadNotificationCount,
} from '../../libs/dto/notification/notification';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../libs/enums/notification.enum';
import { Message } from '../../libs/enums/common.enum';
import { Member } from '../../libs/dto/member/member';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';

@Injectable()
export class NotificationService {
	constructor(
		@InjectModel('Notification') private readonly notificationModel: Model<Notification>,
		@InjectModel('Hotel') private readonly hotelModel: Model<Hotel>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	// Internal API only. Call within the transaction that changes the booking/review.
	async notify(
		type: NotificationType,
		authorId: Types.ObjectId,
		booking: { _id: Types.ObjectId; hotelId: Types.ObjectId; memberId: Types.ObjectId; roomId?: Types.ObjectId },
		session: ClientSession,
		automatic = false,
	): Promise<void> {
		const hotel = await this.hotelModel.findById(booking.hotelId).session(session).lean().exec();
		if (!hotel) throw new NotFoundException(Message.NO_DATA_FOUND);
		const recipients = [hotel.ownerId];
		if (
			[
				NotificationType.BOOKING_CONFIRMED,
				NotificationType.BOOKING_CANCELLED,
				NotificationType.BOOKING_COMPLETED,
			].includes(type)
		)
			recipients.push(booking.memberId);
		if (type !== NotificationType.REVIEW) recipients.push(...(await this.adminIds(session)));
		const titles: Partial<Record<NotificationType, string>> = {
			[NotificationType.BOOKING_CREATED]: 'New booking',
			[NotificationType.BOOKING_CONFIRMED]: 'Booking confirmed',
			[NotificationType.BOOKING_CANCELLED]: 'Booking cancelled',
			[NotificationType.BOOKING_COMPLETED]: 'Booking completed',
			[NotificationType.REVIEW]: 'New hotel review',
		};
		const receivers = [...new Set(recipients.map(String))].filter((id) => automatic || id !== String(authorId));
		if (!receivers.length) return;
		await this.notificationModel.create(
			receivers.map((receiverId) => ({
				authorId,
				receiverId,
				hotelId: booking.hotelId,
				bookingId: type === NotificationType.REVIEW ? undefined : booking._id,
				roomId: booking.roomId,
				notificationType: type,
				notificationStatus: NotificationStatus.WAIT,
				notificationGroup: type === NotificationType.REVIEW ? NotificationGroup.HOTEL : NotificationGroup.BOOKING,
				notificationTitle: automatic ? 'Booking automatically confirmed' : titles[type],
				notificationDesc: hotel.hotelName,
			})),
			{ session, ordered: true },
		);
	}

	private async adminIds(session: ClientSession): Promise<Types.ObjectId[]> {
		const admins = await this.memberModel
			.find({ memberType: MemberType.ADMIN, memberStatus: MemberStatus.ACTIVE })
			.select('_id')
			.session(session)
			.lean()
			.exec();
		return admins.map((admin) => admin._id as unknown as Types.ObjectId);
	}

	async notifyInventoryCreated(
		authorId: Types.ObjectId,
		hotel: { _id: Types.ObjectId; hotelName: string },
		session: ClientSession,
		room?: { _id: Types.ObjectId; roomName: string },
	): Promise<void> {
		const receivers = (await this.adminIds(session)).filter((id) => String(id) !== String(authorId));
		if (!receivers.length) return;
		await this.notificationModel.create(
			receivers.map((receiverId) => ({
				authorId,
				receiverId,
				hotelId: hotel._id,
				roomId: room?._id,
				notificationType: room ? NotificationType.ROOM_CREATED : NotificationType.HOTEL_CREATED,
				notificationGroup: room ? NotificationGroup.ROOM : NotificationGroup.HOTEL,
				notificationStatus: NotificationStatus.WAIT,
				notificationTitle: room ? 'New room added' : 'New hotel added',
				notificationDesc: room ? `${hotel.hotelName}: ${room.roomName}` : hotel.hotelName,
			})),
			{ session, ordered: true },
		);
	}

	async notifySupportMessage(
		authorId: Types.ObjectId,
		inquiry: { _id: Types.ObjectId; noticeTitle: string },
		session: ClientSession,
	): Promise<void> {
		const receivers = (await this.adminIds(session)).filter((id) => String(id) !== String(authorId));
		if (!receivers.length) return;
		// requestId retries reuse the inquiry; one notification per admin, without resetting READ.
		await this.notificationModel.bulkWrite(
			receivers.map((receiverId) => ({
				updateOne: {
					filter: { receiverId, inquiryId: inquiry._id, notificationType: NotificationType.SUPPORT_MESSAGE },
					update: {
						$setOnInsert: {
							authorId,
							receiverId,
							inquiryId: inquiry._id,
							notificationType: NotificationType.SUPPORT_MESSAGE,
							notificationGroup: NotificationGroup.SUPPORT,
							notificationStatus: NotificationStatus.WAIT,
							notificationTitle: 'New support message',
							notificationDesc: inquiry.noticeTitle,
						},
					},
					upsert: true,
				},
			})),
			{ session, ordered: true },
		);
	}

	async getMyNotifications(receiverId: Types.ObjectId, input: NotificationsInquiry): Promise<Notifications> {
		const [result] = await this.notificationModel
			.aggregate<Notifications>([
				{
					$match: {
						receiverId,
						...(input.notificationStatus ? { notificationStatus: input.notificationStatus } : {}),
						...(input.notificationType
							? { notificationType: input.notificationType }
							: input.notificationTypes?.length
								? { notificationType: { $in: input.notificationTypes } }
								: {}),
						...(input.notificationGroup ? { notificationGroup: input.notificationGroup } : {}),
					},
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

	async getUnreadNotificationCounts(receiverId: Types.ObjectId): Promise<UnreadNotificationCount[]> {
		return this.notificationModel
			.aggregate<UnreadNotificationCount>([
				{ $match: { receiverId, notificationStatus: NotificationStatus.WAIT } },
				{ $group: { _id: '$notificationType', total: { $sum: 1 } } },
				{ $project: { _id: 0, notificationType: '$_id', total: 1 } },
			])
			.exec();
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
