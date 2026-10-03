import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsInt, IsMongoId, Max, Min, ValidateIf } from 'class-validator';
import { StayInput } from '../booking/booking.input';
import { RoomSort, RoomType } from '../../enums/room.enum';
import { Room } from './room';
import { TotalCounter } from '../member/member';

@InputType()
export class AvailableRoomsInquiry extends StayInput {
	@IsMongoId()
	@Field(() => String)
	hotelId!: string;

	@IsInt()
	@Min(1)
	@Max(1000000)
	@Field(() => Int, { defaultValue: 1 })
	page: number = 1;

	@IsInt()
	@Min(1)
	@Max(100)
	@Field(() => Int, { defaultValue: 20 })
	limit: number = 20;

	@IsEnum(RoomSort)
	@Field(() => RoomSort, { defaultValue: RoomSort.NEWEST })
	sort: RoomSort = RoomSort.NEWEST;

	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(RoomType)
	@Field(() => RoomType, { nullable: true })
	roomType?: RoomType;
}

@ObjectType()
export class AvailableRoom extends Room {
	@Field(() => Int)
	availableQuantity!: number;
}

@ObjectType()
export class AvailableRooms {
	@Field(() => [AvailableRoom])
	list!: AvailableRoom[];

	@Field(() => [TotalCounter])
	metaCounter!: TotalCounter[];
}
