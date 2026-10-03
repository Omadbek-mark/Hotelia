import { BookingStatus } from '../enums/booking.enum';

export const PENDING_HOLD_MS = 15 * 60 * 1000;

// A missing expiry is treated conservatively for records created before holds were introduced.
export function inventoryBookingFilter(now: Date) {
	return {
		$or: [
			{ bookingStatus: BookingStatus.CONFIRMED },
			{ bookingStatus: BookingStatus.PENDING, $or: [{ expiresAt: { $gt: now } }, { expiresAt: null }] },
		],
	};
}
