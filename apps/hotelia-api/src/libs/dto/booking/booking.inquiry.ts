import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsMongoId, IsString, Matches, Max, Min, ValidateIf } from 'class-validator';
import { BookingStatus } from '../../enums/booking.enum';

@InputType()
export class BookingsInquiry {
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
	@IsEnum(BookingStatus)
	@Field(() => BookingStatus, { nullable: true })
	bookingStatus?: BookingStatus;
}

@InputType()
export class OwnerBookingsInquiry extends BookingsInquiry {
	@ValidateIf((_, value) => value !== undefined)
	@IsMongoId()
	@Field(() => String, { nullable: true })
	hotelId?: string;

	@ValidateIf((_, value) => value !== undefined)
	@IsString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	@Field(() => String, { nullable: true })
	checkIn?: string;

	@ValidateIf((_, value) => value !== undefined)
	@IsString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	@Field(() => String, { nullable: true })
	checkOut?: string;
}
