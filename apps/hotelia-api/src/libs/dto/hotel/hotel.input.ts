import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsEnum, IsIn, IsMongoId, IsString, IsTimeZone, Length, ValidateIf } from 'class-validator';
import { HotelAmenity, HotelStatus, HotelType } from '../../enums/hotel.enum';

@InputType()
export class HotelInput {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(3, 100)
  @Field(() => String)
  hotelName!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(10, 5000)
  @Field(() => String)
  hotelDescription!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(2, 100)
  @Field(() => String)
  hotelCountry!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(2, 100)
  @Field(() => String)
  hotelCity!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(3, 300)
  @Field(() => String)
  hotelAddress!: string;

  @IsTimeZone()
  @Field(() => String)
  hotelTimezone!: string;

  @IsEnum(HotelType)
  @Field(() => HotelType)
  hotelType!: HotelType;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsString({ each: true })
  @Length(1, 2048, { each: true })
  @Field(() => [String])
  hotelImages!: string[];

  @IsArray()
  @ArrayMaxSize(8)
  @ArrayUnique()
  @IsEnum(HotelAmenity, { each: true })
  @Field(() => [HotelAmenity])
  hotelAmenities!: HotelAmenity[];
}
