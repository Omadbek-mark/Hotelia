import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {
	ArrayMaxSize,
	ArrayMinSize,
	ArrayUnique,
	IsArray,
	IsEnum,
	IsInt,
	IsIn,
	ValidateIf,
	IsMongoId,
	IsNumber,
	IsString,
	Length,
	Max,
	Min,
} from 'class-validator';
import { BedType, RoomAmenity, RoomStatus, RoomType } from '../../enums/room.enum';

@InputType()
export class RoomUpdate {
	@IsMongoId()
	@Field(() => String)
	_id!: string;

	@ValidateIf((_, value) => value !== undefined)
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@IsString()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	roomName?: string;

	@ValidateIf((_, value) => value !== undefined)
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@IsString()
	@Length(10, 5000)
	@Field(() => String, { nullable: true })
	roomDescription?: string;

	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(RoomType)
	@Field(() => RoomType, { nullable: true })
	roomType?: RoomType;

	@ValidateIf((_, value) => value !== undefined)
	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0.01)
	@Max(Number.MAX_SAFE_INTEGER / 100)
	@Field(() => Float, { nullable: true })
	roomPrice?: number;

	@ValidateIf((_, value) => value !== undefined)
	@IsInt()
	@Min(1)
	@Max(2147483647)
	@Field(() => Int, { nullable: true })
	roomCapacity?: number;

	@ValidateIf((_, value) => value !== undefined)
	@IsInt()
	@Min(1)
	@Max(2147483647)
	@Field(() => Int, { nullable: true })
	roomQuantity?: number;

	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(BedType)
	@Field(() => BedType, { nullable: true })
	bedType?: BedType;

	@ValidateIf((_, value) => value !== undefined)
	@IsNumber()
	@Min(0.01)
	@Field(() => Float, { nullable: true })
	roomSize?: number;

	@ValidateIf((_, value) => value !== undefined)
	@Transform(({ value }) =>
		Array.isArray(value) ? value.map((image) => (typeof image === 'string' ? image.trim() : image)) : value,
	)
	@IsArray()
	@ArrayMinSize(1)
	@ArrayMaxSize(20)
	@ArrayUnique()
	@IsString({ each: true })
	@Length(1, 2048, { each: true })
	@Field(() => [String], { nullable: true })
	roomImages?: string[];

	@ValidateIf((_, value) => value !== undefined)
	@IsArray()
	@ArrayMaxSize(7)
	@ArrayUnique()
	@IsEnum(RoomAmenity, { each: true })
	@Field(() => [RoomAmenity], { nullable: true })
	roomAmenities?: RoomAmenity[];

	@ValidateIf((_, value) => value !== undefined)
	@IsIn([RoomStatus.ACTIVE, RoomStatus.PAUSED])
	@Field(() => RoomStatus, { nullable: true })
	roomStatus?: RoomStatus;
}
