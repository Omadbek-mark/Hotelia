import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {
	ArrayMaxSize,
	ArrayMinSize,
	ArrayUnique,
	IsArray,
	IsEnum,
	IsInt,
	IsMongoId,
	IsNumber,
	IsString,
	Length,
	Max,
	Min,
} from 'class-validator';
import { BedType, RoomAmenity, RoomType } from '../../enums/room.enum';

@InputType()
export class RoomInput {
	@IsMongoId()
	@Field(() => String)
	hotelId!: string;

	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@IsString()
	@Length(3, 100)
	@Field(() => String)
	roomName!: string;

	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@IsString()
	@Length(10, 5000)
	@Field(() => String)
	roomDescription!: string;

	@IsEnum(RoomType)
	@Field(() => RoomType)
	roomType!: RoomType;

	@IsNumber()
	@Min(0.01)
	@Max(Number.MAX_SAFE_INTEGER / 100)
	@Field(() => Float)
	roomPrice!: number;

	@IsInt()
	@Min(1)
	@Max(2147483647)
	@Field(() => Int)
	roomCapacity!: number;

	@IsInt()
	@Min(1)
	@Max(2147483647)
	@Field(() => Int)
	roomQuantity!: number;

	@IsEnum(BedType)
	@Field(() => BedType)
	bedType!: BedType;

	@IsNumber()
	@Min(0.01)
	@Field(() => Float)
	roomSize!: number;

	@Transform(({ value }) =>
		Array.isArray(value) ? value.map((image) => (typeof image === 'string' ? image.trim() : image)) : value,
	)
	@IsArray()
	@ArrayMinSize(1)
	@ArrayMaxSize(20)
	@ArrayUnique()
	@IsString({ each: true })
	@Length(1, 2048, { each: true })
	@Field(() => [String])
	roomImages!: string[];

	@IsArray()
	@ArrayMaxSize(7)
	@ArrayUnique()
	@IsEnum(RoomAmenity, { each: true })
	@Field(() => [RoomAmenity])
	roomAmenities!: RoomAmenity[];
}
