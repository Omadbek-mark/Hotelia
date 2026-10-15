import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsMongoId, IsString, IsUUID, Matches, Max, Min } from 'class-validator';
import { PaymentMethod } from '../../enums/payment.enum';

@InputType()
export class StayInput {
	@IsString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	@Field(() => String)
	checkIn!: string;

	@IsString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	@Field(() => String)
	checkOut!: string;

	@IsInt()
	@Min(1)
	@Max(2147483647)
	@Field(() => Int)
	guests!: number;

	@IsInt()
	@Min(1)
	@Max(2147483647)
	@Field(() => Int, { defaultValue: 1 })
	rooms: number = 1;
}

// Member, hotel, nights and prices will be resolved by the server when creating a booking.
@InputType()
export class BookingInput extends StayInput {
	@IsEnum(PaymentMethod)
	@Field(() => PaymentMethod, { defaultValue: PaymentMethod.CEO_BANK_ACCOUNT })
	paymentMethod?: PaymentMethod = PaymentMethod.CEO_BANK_ACCOUNT;
	@IsUUID('4')
	@Field(() => String)
	requestId!: string;

	@IsMongoId()
	@Field(() => String)
	roomId!: string;
}
