import { Schema } from 'mongoose';
import { CardBrand, PaymentCardStatus } from '../libs/enums/payment.enum';

// Demo metadata only: full card numbers and CVV are never sent to this model.
const PaymentCardSchema = new Schema(
	{
		memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true, immutable: true },
		cardBrand: { type: String, enum: CardBrand, required: true },
		cardLast4: { type: String, required: true, match: /^\d{4}$/ },
		cardHolderName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
		expiryMonth: { type: Number, required: true, min: 1, max: 12, validate: Number.isInteger },
		expiryYear: { type: Number, required: true, min: 2000, max: 2100, validate: Number.isInteger },
		cardStatus: { type: String, enum: PaymentCardStatus, required: true, default: PaymentCardStatus.PENDING },
	},
	{ timestamps: true, collection: 'paymentCards' },
);
PaymentCardSchema.index({ memberId: 1 }, { unique: true });
export default PaymentCardSchema;
