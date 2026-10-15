import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { PaymentCard, PaymentCardInput } from '../../libs/dto/payment/payment-card';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PaymentService } from './payment.service';

@Resolver(() => PaymentCard)
@UseGuards(AuthGuard)
export class PaymentResolver {
	constructor(private readonly paymentService: PaymentService) {}
	@Query(() => PaymentCard, { nullable: true })
	getMyPaymentCard(@AuthMember('_id') memberId: Types.ObjectId): Promise<PaymentCard | null> {
		return this.paymentService.getMyPaymentCard(memberId);
	}
	@Mutation(() => PaymentCard)
	saveMyPaymentCard(
		@AuthMember('_id') memberId: Types.ObjectId,
		@Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
		input: PaymentCardInput,
	): Promise<PaymentCard> {
		return this.paymentService.saveMyPaymentCard(memberId, input);
	}
}
