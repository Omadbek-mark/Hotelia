import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsInt, Max, Min, ValidateIf } from 'class-validator';
import { Types } from 'mongoose';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { TotalCounter } from '../member/member';

@ObjectType()
export class Notification {
	@Field(() => String) _id!: Types.ObjectId;
	@Field(() => NotificationType) notificationType!: NotificationType;
	@Field(() => NotificationStatus) notificationStatus!: NotificationStatus;
	@Field(() => NotificationGroup) notificationGroup!: NotificationGroup;
	@Field(() => String) notificationTitle!: string;
	@Field(() => String, { nullable: true }) notificationDesc?: string;
	@Field(() => String) authorId!: Types.ObjectId;
	@Field(() => String) receiverId!: Types.ObjectId;
	@Field(() => String, { nullable: true }) hotelId?: Types.ObjectId;
	@Field(() => String, { nullable: true }) bookingId?: Types.ObjectId;
	@Field(() => Date) createdAt!: Date;
	@Field(() => Date) updatedAt!: Date;
}

@ObjectType()
export class Notifications {
	@Field(() => [Notification]) list!: Notification[];
	@Field(() => [TotalCounter]) metaCounter!: TotalCounter[];
}

@InputType()
export class NotificationsInquiry {
	@IsInt()
	@Min(1)
	@Max(1000000)
	@Field(() => Int, { defaultValue: 1 })
	page: number = 1;
	@IsInt()
	@Min(1)
	@Max(100)
	@Field(() => Int, { defaultValue: 20 })
	limit: number = 20;
	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(NotificationStatus)
	@Field(() => NotificationStatus, { nullable: true })
	notificationStatus?: NotificationStatus;
}
