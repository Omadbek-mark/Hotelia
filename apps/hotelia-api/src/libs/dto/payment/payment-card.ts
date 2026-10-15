import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsInt, IsString, Length, Matches, Max, Min } from 'class-validator';
import type { Types } from 'mongoose';
import { CardBrand, PaymentCardStatus } from '../../enums/payment.enum';

@ObjectType()
export class PaymentCard {
	memberId!: Types.ObjectId;
	@Field(() => String) _id!: Types.ObjectId;
	@Field(() => CardBrand) cardBrand!: CardBrand;
	@Field(() => String) cardLast4!: string;
	@Field(() => String) cardHolderName!: string;
	@Field(() => Int) expiryMonth!: number;
	@Field(() => Int) expiryYear!: number;
	@Field(() => PaymentCardStatus) cardStatus!: PaymentCardStatus;
	@Field(() => Date) createdAt!: Date;
	@Field(() => Date) updatedAt!: Date;
}

@InputType()
export class PaymentCardInput {
	@IsEnum(CardBrand) @Field(() => CardBrand) cardBrand!: CardBrand;
	@IsString() @Matches(/^\d{4}$/) @Field(() => String) cardLast4!: string;
	@IsString() @Length(2, 80) @Field(() => String) cardHolderName!: string;
	@IsInt() @Min(1) @Max(12) @Field(() => Int) expiryMonth!: number;
	@IsInt() @Min(2000) @Max(2100) @Field(() => Int) expiryYear!: number;
}
