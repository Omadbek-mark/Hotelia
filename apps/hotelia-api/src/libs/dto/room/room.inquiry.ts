import { Field, InputType, Int, OmitType } from '@nestjs/graphql';
import { IsEnum, IsIn, IsInt, IsMongoId, Max, Min, ValidateIf } from 'class-validator';
import { RoomSort, RoomStatus, RoomType } from '../../enums/room.enum';

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

@InputType()
export class OwnerRoomsInquiry extends RoomsInquiry {
	@ValidateIf((_, value) => value !== undefined)
	@IsIn([RoomStatus.ACTIVE, RoomStatus.PAUSED])
	@Field(() => RoomStatus, { nullable: true })
	roomStatus?: RoomStatus;
}

@InputType()
export class AllRoomsInquiry extends OmitType(RoomsInquiry, ['hotelId'] as const) {
	@ValidateIf((_, value) => value !== undefined)
	@IsMongoId()
	@Field(() => String, { nullable: true })
	hotelId?: string;

	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(RoomStatus)
	@Field(() => RoomStatus, { nullable: true })
	roomStatus?: RoomStatus;
}
