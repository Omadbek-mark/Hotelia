import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import { TotalCounter } from '../member/member';
import { BookingStatus } from '../../enums/booking.enum';
import { PaymentMethod, PaymentStatus } from '../../enums/payment.enum';
import { MemberPublic } from '../member/member-public';
import { BookingHotelData, BookingRoomData } from './booking-data';

@ObjectType()
export class Booking {
	@Field(() => PaymentMethod, { nullable: true }) paymentMethod?: PaymentMethod;
	@Field(() => PaymentStatus, { nullable: true }) paymentStatus?: PaymentStatus;
	@Field(() => BookingHotelData, { nullable: true })
	hotelData?: BookingHotelData | null;

	@Field(() => BookingRoomData, { nullable: true })
	roomData?: BookingRoomData | null;

	@Field(() => MemberPublic, { nullable: true })
	memberData?: MemberPublic | null;

	@Field(() => String)
	currency!: string;

	@Field(() => Date, { nullable: true })
	expiresAt?: Date;

	@Field(() => Date, { nullable: true }) freeCancellationUntil?: Date;
	@Field(() => Float, { nullable: true }) cancellationFeeRate?: number;
	@Field(() => Float, { nullable: true }) cancellationFee?: number;
	@Field(() => Float, { nullable: true }) refundAmount?: number;
	@Field(() => Date, { nullable: true }) cancelledAt?: Date;
	@Field(() => String, { nullable: true }) cancelledBy?: Types.ObjectId;
	@Field(() => Date, { nullable: true }) confirmedAt?: Date;
	@Field(() => Boolean, { nullable: true }) confirmedAutomatically?: boolean;

	requestId?: string;

	@Field(() => String)
	_id!: Types.ObjectId;

	@Field(() => String)
	memberId!: Types.ObjectId;

	@Field(() => String)
	hotelId!: Types.ObjectId;

	@Field(() => String)
	roomId!: Types.ObjectId;

	@Field(() => Date)
	checkIn!: Date;

	@Field(() => Date)
	checkOut!: Date;

	@Field(() => Date)
	createdAt!: Date;

	@Field(() => Date)
	updatedAt!: Date;

	@Field(() => Int)
	guests!: number;

	@Field(() => Int)
	rooms!: number;

	@Field(() => Int)
	nights!: number;

	@Field(() => Float)
	pricePerNight!: number;

	@Field(() => Float)
	totalPrice!: number;

	@Field(() => BookingStatus)
	bookingStatus!: BookingStatus;
}

@ObjectType()
export class Bookings {
	@Field(() => [Booking])
	list!: Booking[];

	@Field(() => [TotalCounter])
	metaCounter!: TotalCounter[];
}
