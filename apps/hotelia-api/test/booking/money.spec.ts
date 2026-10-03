import { bookingPrice, isUsdAmount } from '../../src/libs/booking/money';
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
});
