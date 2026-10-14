import { registerEnumType } from '@nestjs/graphql';

export enum PaymentMethod {
	CEO_BANK_ACCOUNT = 'CEO_BANK_ACCOUNT',
	BANK_CARD = 'BANK_CARD',
}
export enum PaymentStatus {
	DEMO_ONLY = 'DEMO_ONLY',
}
export enum CardBrand {
	VISA = 'VISA',
	MASTERCARD = 'MASTERCARD',
}
export enum PaymentCardStatus {
	PENDING = 'PENDING',
}
registerEnumType(PaymentMethod, { name: 'PaymentMethod' });
registerEnumType(PaymentStatus, { name: 'PaymentStatus' });
registerEnumType(CardBrand, { name: 'CardBrand' });
registerEnumType(PaymentCardStatus, { name: 'PaymentCardStatus' });
