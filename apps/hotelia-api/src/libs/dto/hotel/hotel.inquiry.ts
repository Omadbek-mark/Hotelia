import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	ArrayMaxSize,
	ArrayUnique,
	IsArray,
	IsEnum,
	IsIn,
	IsInt,
	IsNumber,
	IsObject,
	IsString,
	Max,
	MaxLength,
	Min,
	ValidateIf,
	ValidateNested,
} from 'class-validator';
import { HotelAmenity, HotelSort, HotelStatus, HotelType } from '../../enums/hotel.enum';

@InputType()
export class HotelSearch {
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
