import { bookingPrice, isUsdAmount, cancellationAmounts } from '../../src/libs/booking/money';
describe('USD booking prices', () => {
	it('multiplies integer cents accurately', () => {
		expect(bookingPrice(19.99, 3, 2)).toEqual({ currency: 'USD', pricePerNight: 19.99, totalPrice: 119.94 });
		expect(bookingPrice(0.1, 3, 1).totalPrice).toBe(0.3);
	});
	it.each([0, -1, 1.005, Infinity, NaN])('rejects invalid price %s', (price) => {
		expect(isUsdAmount(price)).toBe(false);
		expect(() => bookingPrice(price, 1, 1)).toThrow();
	});
	it('rejects overflow and invalid quantities', () => {
		expect(() => bookingPrice(1000000000, 365, 2147483647)).toThrow();
		expect(() => bookingPrice(10, 1.5, 1)).toThrow();
		expect(() => bookingPrice(10, 1, 0)).toThrow();
	});
	it('calculates 5% in cents and preserves the full total across fee and refund', () => {
		expect(cancellationAmounts(130, true)).toEqual({ cancellationFee: 6.5, refundAmount: 123.5 });
		expect(cancellationAmounts(1.1, true)).toEqual({ cancellationFee: 0.06, refundAmount: 1.04 });
		expect(cancellationAmounts(0.1, true)).toEqual({ cancellationFee: 0.01, refundAmount: 0.09 });
		expect(cancellationAmounts(130, false)).toEqual({ cancellationFee: 0, refundAmount: 130 });
	});
});
