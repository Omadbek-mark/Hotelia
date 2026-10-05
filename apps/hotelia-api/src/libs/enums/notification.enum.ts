import { registerEnumType } from '@nestjs/graphql';

export enum NotificationType {
	LIKE = 'LIKE',
	COMMENT = 'COMMENT',
	FOLLOW = 'FOLLOW',
	BOOKING_CREATED = 'BOOKING_CREATED',
	BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
	BOOKING_CANCELLED = 'BOOKING_CANCELLED',
	BOOKING_COMPLETED = 'BOOKING_COMPLETED',
	REVIEW = 'REVIEW',
}
registerEnumType(NotificationType, {
	name: 'NotificationType',
});

export enum NotificationStatus {
	WAIT = 'WAIT',
	READ = 'READ',
}
registerEnumType(NotificationStatus, {
	name: 'NotificationStatus',
});

export enum NotificationGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	HOTEL = 'HOTEL',
	BOOKING = 'BOOKING',
}
registerEnumType(NotificationGroup, {
	name: 'NotificationGroup',
});
