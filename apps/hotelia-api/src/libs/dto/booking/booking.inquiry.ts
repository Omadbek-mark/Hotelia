import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, Max, Min, ValidateIf } from 'class-validator';
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
