import { registerEnumType } from '@nestjs/graphql';

export enum RoomType {
	SINGLE = 'SINGLE',
	DOUBLE = 'DOUBLE',
	TWIN = 'TWIN',
	DELUXE = 'DELUXE',
	SUITE = 'SUITE',
	FAMILY = 'FAMILY',
}
registerEnumType(RoomType, { name: 'RoomType' });

export enum RoomStatus {
	ACTIVE = 'ACTIVE',
	PAUSED = 'PAUSED',
	DELETE = 'DELETE',
}
registerEnumType(RoomStatus, { name: 'RoomStatus' });

export enum BedType {
	SINGLE = 'SINGLE',
	DOUBLE = 'DOUBLE',
	QUEEN = 'QUEEN',
	KING = 'KING',
	BUNK = 'BUNK',
}
registerEnumType(BedType, { name: 'BedType' });

export enum RoomAmenity {
	WIFI = 'WIFI',
	AIR_CONDITIONING = 'AIR_CONDITIONING',
	TV = 'TV',
	MINIBAR = 'MINIBAR',
	SAFE = 'SAFE',
	BALCONY = 'BALCONY',
	PRIVATE_BATHROOM = 'PRIVATE_BATHROOM',
}
registerEnumType(RoomAmenity, { name: 'RoomAmenity' });

export enum RoomSort {
	NEWEST = 'NEWEST',
	PRICE_ASC = 'PRICE_ASC',
	PRICE_DESC = 'PRICE_DESC',
}
registerEnumType(RoomSort, { name: 'RoomSort' });
