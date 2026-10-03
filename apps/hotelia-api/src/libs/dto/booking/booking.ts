import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import { TotalCounter } from '../member/member';
import { BookingStatus } from '../../enums/booking.enum';

@ObjectType()
export class Booking {
	@Field(() => String)
	currency!: string;

	@Field(() => Date, { nullable: true })
	expiresAt?: Date;

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
