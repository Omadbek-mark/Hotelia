import { assertNotPastCheckIn, getStayDates, parseStayDate } from '../../src/libs/booking/stay-dates';

describe('hotel-local stay dates', () => {
	it.each(['2030-02-30', '2030-13-01', '2030-2-01', '2030-01-01T12:00:00Z', 'bad'])(
		'rejects invalid date %s',
		(value) => {
			expect(() => parseStayDate(value)).toThrow();
		},
	);
	it('counts checkout-exclusive nights', () => {
		expect(getStayDates('2030-09-10', '2030-09-15').nights).toBe(5);
	});
	it('handles leap days and DST dates as calendar nights', () => {
		expect(getStayDates('2028-02-28', '2028-03-01').nights).toBe(2);
		expect(getStayDates('2030-03-09', '2030-03-11').nights).toBe(2);
	});
	it.each([
		['2030-09-10', '2030-09-10'],
		['2030-09-15', '2030-09-10'],
		['2030-01-01', '2031-01-02'],
	])('rejects invalid interval %s to %s', (start, end) => {
		expect(() => getStayDates(start, end)).toThrow();
	});
	it('uses the hotel timezone when deciding whether check-in is in the past', () => {
		const now = new Date('2030-01-01T16:00:00Z');
		expect(() => assertNotPastCheckIn(parseStayDate('2030-01-01'), 'Asia/Seoul', now)).toThrow();
		expect(() => assertNotPastCheckIn(parseStayDate('2030-01-02'), 'Asia/Seoul', now)).not.toThrow();
		expect(() => assertNotPastCheckIn(parseStayDate('2030-01-01'), 'America/Los_Angeles', now)).not.toThrow();
	});
});
