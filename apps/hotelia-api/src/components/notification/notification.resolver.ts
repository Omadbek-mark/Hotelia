import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { Notification, Notifications, NotificationsInquiry } from '../../libs/dto/notification/notification';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { NotificationService } from './notification.service';

@Resolver()
@UseGuards(AuthGuard)
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) {}
	@Query(() => Notifications)
	getMyNotifications(
		@AuthMember('_id') memberId: Types.ObjectId,
		@Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
		input: NotificationsInquiry,
	): Promise<Notifications> {
		return this.notificationService.getMyNotifications(memberId, input);
	}
	@Query(() => Int)
	getUnreadNotificationCount(@AuthMember('_id') memberId: Types.ObjectId): Promise<number> {
		return this.notificationService.getUnreadNotificationCount(memberId);
	}
	@Mutation(() => Notification)
	markNotificationRead(
		@AuthMember('_id') memberId: Types.ObjectId,
		@Args('notificationId') id: string,
	): Promise<Notification> {
		return this.notificationService.markNotificationRead(memberId, shapeIntoMongoObjectId(id));
	}
}
