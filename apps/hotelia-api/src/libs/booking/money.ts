import { BadRequestException } from '@nestjs/common';

export const BOOKING_CURRENCY = 'USD';

// Integer cents: round 5% to the nearest cent, with half-cents rounded up.
export function cancellationAmounts(totalPrice: number, chargeFee: boolean) {
	if (!isUsdAmount(totalPrice)) throw new BadRequestException('Invalid booking total');
	const cents = BigInt(Math.round(totalPrice * 100));
	const fee = chargeFee ? (cents * 5n + 50n) / 100n : 0n;
	return { cancellationFee: Number(fee) / 100, refundAmount: Number(cents - fee) / 100 };
}

export function isUsdAmount(value: unknown): value is number {
	if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return false;
	if (!/^\d+(\.\d{1,2})?$/.test(String(value))) return false;
	const cents = Math.round(value * 100);
	return Number.isSafeInteger(cents) && cents / 100 === value;
}

export function bookingPrice(pricePerNight: number, nights: number, rooms: number) {
	if (
		!isUsdAmount(pricePerNight) ||
		!Number.isSafeInteger(nights) ||
		nights < 1 ||
		!Number.isSafeInteger(rooms) ||
		rooms < 1
	) {
		throw new BadRequestException('Invalid USD price or booking quantity');
	}
	const cents = BigInt(Math.round(pricePerNight * 100)) * BigInt(nights) * BigInt(rooms);
	if (cents > BigInt(Number.MAX_SAFE_INTEGER)) throw new BadRequestException('Booking total is too large');
	const totalPrice = Number(cents) / 100;
	if (!isUsdAmount(totalPrice) || BigInt(Math.round(totalPrice * 100)) !== cents) {
		throw new BadRequestException('Booking total cannot be represented accurately');
	}
	return { currency: BOOKING_CURRENCY, pricePerNight, totalPrice };
}
