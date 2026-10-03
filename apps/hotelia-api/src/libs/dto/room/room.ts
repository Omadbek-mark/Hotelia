import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import { TotalCounter } from '../member/member';
import { BedType, RoomAmenity, RoomStatus, RoomType } from '../../enums/room.enum';

@ObjectType()
export class Room {
	@Field(() => String)
	_id!: Types.ObjectId;

	@Field(() => String)
	hotelId!: Types.ObjectId;

	@Field(() => String)
	roomName!: string;

	@Field(() => String)
	roomDescription!: string;

	@Field(() => RoomType)
	roomType!: RoomType;

	@Field(() => Float)
	roomPrice!: number;

	@Field(() => Int)
	roomCapacity!: number;

	@Field(() => Int)
	roomQuantity!: number;

	@Field(() => BedType)
	bedType!: BedType;

	@Field(() => Float)
	roomSize!: number;

	@Field(() => [String])
	roomImages!: string[];

	@Field(() => [RoomAmenity])
	roomAmenities!: RoomAmenity[];

	@Field(() => RoomStatus)
	roomStatus!: RoomStatus;
	@Field(() => Date)
	createdAt!: Date;
	@Field(() => Date)
	updatedAt!: Date;
	@Field(() => Date, { nullable: true })
	deletedAt?: Date;
}

@ObjectType()
export class Rooms {
	@Field(() => [Room])
	list!: Room[];

	@Field(() => [TotalCounter])
	metaCounter!: TotalCounter[];
}
