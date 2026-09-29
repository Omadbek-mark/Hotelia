import { registerEnumType } from '@nestjs/graphql';

export enum HotelType {
	HOTEL = 'HOTEL',
	RESORT = 'RESORT',
	HOSTEL = 'HOSTEL',
	APARTMENT = 'APARTMENT',
	GUEST_HOUSE = 'GUEST_HOUSE',
}
registerEnumType(HotelType, { name: 'HotelType' });

export enum HotelStatus {
	ACTIVE = 'ACTIVE',
	PAUSED = 'PAUSED',
	DELETE = 'DELETE',
}
registerEnumType(HotelStatus, { name: 'HotelStatus' });

export enum HotelAmenity {
	WIFI = 'WIFI',
	POOL = 'POOL',
	PARKING = 'PARKING',
	BREAKFAST = 'BREAKFAST',
	GYM = 'GYM',
	SPA = 'SPA',
	AIR_CONDITIONING = 'AIR_CONDITIONING',
	RESTAURANT = 'RESTAURANT',
}
registerEnumType(HotelAmenity, { name: 'HotelAmenity' });
