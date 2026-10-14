import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaymentCard, PaymentCardInput } from '../../libs/dto/payment/payment-card';
import { CardBrand, PaymentCardStatus } from '../../libs/enums/payment.enum';

@Injectable()
export class PaymentService {
	constructor(@InjectModel('PaymentCard') private readonly cards: Model<PaymentCard>) {}
	getMyPaymentCard(memberId: Types.ObjectId): Promise<PaymentCard | null> {
		return this.cards.findOne({ memberId }).lean().exec();
	}
	async saveMyPaymentCard(memberId: Types.ObjectId, input: PaymentCardInput): Promise<PaymentCard> {
		const now = new Date();
		const validDemo =
			(input.cardBrand === CardBrand.VISA && input.cardLast4 === '4242') ||
			(input.cardBrand === CardBrand.MASTERCARD && input.cardLast4 === '4444');
		const holder = input.cardHolderName?.trim();
		if (
			!validDemo ||
			!holder ||
			holder.length < 2 ||
			holder.length > 80 ||
			!Number.isInteger(input.expiryMonth) ||
			input.expiryMonth < 1 ||
			input.expiryMonth > 12 ||
			!Number.isInteger(input.expiryYear) ||
			input.expiryYear > 2100 ||
			input.expiryYear * 12 + input.expiryMonth < now.getUTCFullYear() * 12 + now.getUTCMonth() + 1
		) {
			throw new BadRequestException('Use a supported demo card with a valid expiry date and holder name.');
		}
		const changes = {
			cardBrand: input.cardBrand,
			cardLast4: input.cardLast4,
			cardHolderName: holder,
			expiryMonth: input.expiryMonth,
			expiryYear: input.expiryYear,
			cardStatus: PaymentCardStatus.PENDING,
		};
		try {
			return await this.cards
				.findOneAndUpdate({ memberId }, { $set: changes }, { upsert: true, new: true, runValidators: true })
				.exec();
		} catch (error) {
			// Concurrent submissions still update the single private card for this member.
			if ((error as { code?: number }).code !== 11000) throw error;
			return this.cards
				.findOneAndUpdate({ memberId }, { $set: changes }, { new: true, runValidators: true })
				.orFail()
				.exec();
		}
	}
}
