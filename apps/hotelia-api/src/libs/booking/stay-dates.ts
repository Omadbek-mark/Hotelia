import { BadRequestException } from '@nestjs/common';

export const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_STAY_NIGHTS = 365;

// UTC midnight is a storage convention for hotel-local calendar dates, not an arrival time.
export function parseStayDate(value: string): Date {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		throw new BadRequestException('Use YYYY-MM-DD dates');
	}
	const date = new Date(`${value}T00:00:00.000Z`);
	if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
		throw new BadRequestException('Invalid calendar date');
	}
	return date;
}

export function getStayDates(checkIn: string, checkOut: string) {
	const start = parseStayDate(checkIn);
	const end = parseStayDate(checkOut);
	const nights = (end.getTime() - start.getTime()) / DAY_MS;
	if (nights < 1 || nights > MAX_STAY_NIGHTS) {
		throw new BadRequestException(`Stay must be between 1 and ${MAX_STAY_NIGHTS} nights`);
	}
	return { checkIn: start, checkOut: end, nights };
}

export function assertNotPastCheckIn(checkIn: Date, timezone: string, now = new Date()): void {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).formatToParts(now);
	const part = (type: string) => parts.find((item) => item.type === type)!.value;
	const today = `${part('year')}-${part('month')}-${part('day')}`;
	if (checkIn.getTime() < parseStayDate(today).getTime()) {
		throw new BadRequestException('Check-in cannot be before today in the hotel timezone');
	}
}
