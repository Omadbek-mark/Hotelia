import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsMongoId, Max, Min, ValidateIf } from 'class-validator';
import { RoomSort, RoomType } from '../../enums/room.enum';

@InputType()
export class RoomsInquiry {
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
