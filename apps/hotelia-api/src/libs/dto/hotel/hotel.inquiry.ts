import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	ArrayMaxSize,
	ArrayUnique,
	IsArray,
	IsEnum,
	IsIn,
	IsInt,
	IsMongoId,
	IsNumber,
	IsObject,
	IsString,
	Max,
	MaxLength,
	Matches,
	Min,
	ValidateIf,
	ValidateNested,
} from 'class-validator';
import { HotelAmenity, HotelSort, HotelStatus, HotelType } from '../../enums/hotel.enum';
import { RoomType } from '../../enums/room.enum';

@InputType()
export class HotelSearch {
	@ValidateIf((_, value) => value !== undefined)
	@IsString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	@Field(() => String, { nullable: true })
	checkIn?: string;

	@ValidateIf((_, value) => value !== undefined)
	@IsString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	@Field(() => String, { nullable: true })
	checkOut?: string;

	@ValidateIf((_, value) => value !== undefined)
	@IsInt()
	@Min(1)
	@Max(2147483647)
	@Field(() => Int, { nullable: true })
	guests?: number;

	@ValidateIf((_, value) => value !== undefined)
	@IsInt()
	@Min(1)
	@Max(2147483647)
	@Field(() => Int, { nullable: true })
	rooms?: number;

	@ValidateIf((_, value) => value !== undefined)
	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0)
	@Max(Number.MAX_SAFE_INTEGER / 100)
	@Field(() => Float, { nullable: true })
	minPrice?: number;

	@ValidateIf((_, value) => value !== undefined)
	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0)
	@Max(Number.MAX_SAFE_INTEGER / 100)
	@Field(() => Float, { nullable: true })
	maxPrice?: number;

	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(RoomType)
	@Field(() => RoomType, { nullable: true })
	roomType?: RoomType;

	@ValidateIf((_, value) => value !== undefined)
	@IsString()
	@MaxLength(100)
	@Field(() => String, { nullable: true })
	text?: string;

	@ValidateIf((_, value) => value !== undefined)
	@IsString()
	@MaxLength(100)
	@Field(() => String, { nullable: true })
	destination?: string;

	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(HotelType)
	@Field(() => HotelType, { nullable: true })
	hotelType?: HotelType;

	@ValidateIf((_, value) => value !== undefined)
	@IsNumber()
	@Min(0)
	@Max(5)
	@Field(() => Float, { nullable: true })
	minRating?: number;

	@ValidateIf((_, value) => value !== undefined)
	@IsArray()
	@ArrayMaxSize(8)
	@ArrayUnique()
	@IsEnum(HotelAmenity, { each: true })
	@Field(() => [HotelAmenity], { nullable: true })
	amenities?: HotelAmenity[];
}

@InputType()
export class HotelsInquiry {
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

	@IsEnum(HotelSort)
	@Field(() => HotelSort, { defaultValue: HotelSort.NEWEST })
	sort: HotelSort = HotelSort.NEWEST;

	@ValidateIf((_, value) => value !== undefined)
	@IsObject()
	@ValidateNested()
	@Type(() => HotelSearch)
	@Field(() => HotelSearch, { nullable: true })
	search?: HotelSearch;
}

@InputType()
export class OwnerHotelsInquiry extends HotelsInquiry {
	@ValidateIf((_, value) => value !== undefined)
	@IsIn([HotelStatus.ACTIVE, HotelStatus.PAUSED])
	@Field(() => HotelStatus, { nullable: true })
	hotelStatus?: HotelStatus;
}

@InputType()
export class AllHotelsInquiry extends HotelsInquiry {
	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(HotelStatus)
	@Field(() => HotelStatus, { nullable: true })
	hotelStatus?: HotelStatus;

	@ValidateIf((_, value) => value !== undefined)
	@IsMongoId()
	@Field(() => String, { nullable: true })
	ownerId?: string;
}
