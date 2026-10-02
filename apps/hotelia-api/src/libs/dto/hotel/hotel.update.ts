import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {
	ArrayMaxSize,
	ArrayMinSize,
	ArrayUnique,
	IsArray,
	IsEnum,
	IsIn,
	IsMongoId,
	IsString,
	IsTimeZone,
	Length,
	ValidateIf,
} from 'class-validator';
import { HotelAmenity, HotelStatus, HotelType } from '../../enums/hotel.enum';

@InputType()
export class HotelUpdate {
	@IsMongoId()
	@Field(() => String)
	_id!: string;

	@ValidateIf((_, value) => value !== undefined)
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@IsString()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	hotelName?: string;

	@ValidateIf((_, value) => value !== undefined)
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@IsString()
	@Length(10, 5000)
	@Field(() => String, { nullable: true })
	hotelDescription?: string;

	@ValidateIf((_, value) => value !== undefined)
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@IsString()
	@Length(2, 100)
	@Field(() => String, { nullable: true })
	hotelCountry?: string;

	@ValidateIf((_, value) => value !== undefined)
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@IsString()
	@Length(2, 100)
	@Field(() => String, { nullable: true })
	hotelCity?: string;

	@ValidateIf((_, value) => value !== undefined)
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@IsString()
	@Length(3, 300)
	@Field(() => String, { nullable: true })
	hotelAddress?: string;

	@ValidateIf((_, value) => value !== undefined)
	@IsTimeZone()
	@Field(() => String, { nullable: true })
	hotelTimezone?: string;

	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(HotelType)
	@Field(() => HotelType, { nullable: true })
	hotelType?: HotelType;

	@ValidateIf((_, value) => value !== undefined)
	@IsArray()
	@ArrayMinSize(1)
	@ArrayMaxSize(20)
	@ArrayUnique()
	@IsString({ each: true })
	@Length(1, 2048, { each: true })
	@Field(() => [String], { nullable: true })
	hotelImages?: string[];

	@ValidateIf((_, value) => value !== undefined)
	@IsArray()
	@ArrayMaxSize(8)
	@ArrayUnique()
	@IsEnum(HotelAmenity, { each: true })
	@Field(() => [HotelAmenity], { nullable: true })
	hotelAmenities?: HotelAmenity[];

	// Deletion will use a dedicated mutation.
	@ValidateIf((_, value) => value !== undefined)
	@IsIn([HotelStatus.ACTIVE, HotelStatus.PAUSED])
	@Field(() => HotelStatus, { nullable: true })
	hotelStatus?: HotelStatus;
}
