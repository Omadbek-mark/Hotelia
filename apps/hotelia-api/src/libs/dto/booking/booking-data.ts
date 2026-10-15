import { Field, ObjectType } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import { RoomType } from '../../enums/room.enum';

@ObjectType()
export class BookingHotelData {
	@Field(() => String)
	_id!: Types.ObjectId;

	@Field(() => String)
	hotelName!: string;

	@Field(() => String)
	hotelCountry!: string;

	@Field(() => String)
	hotelCity!: string;

	@Field(() => String)
	hotelAddress!: string;

	@Field(() => String)
	hotelTimezone!: string;

	@Field(() => [String])
	hotelImages!: string[];
}

@ObjectType()
export class BookingRoomData {
	@Field(() => String)
	_id!: Types.ObjectId;

	@Field(() => String)
	roomName!: string;

	@Field(() => RoomType)
	roomType!: RoomType;

	@Field(() => [String])
	roomImages!: string[];
}
