import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import { HotelAmenity, HotelStatus, HotelType } from '../../enums/hotel.enum';
import { MemberPublic } from '../member/member-public';
import { TotalCounter } from '../member/member';

@ObjectType()
export class Hotel {
	@Field(() => MemberPublic, { nullable: true })
	memberData?: MemberPublic | null;

	@Field(() => String)
	_id!: Types.ObjectId;

	@Field(() => String)
	ownerId!: Types.ObjectId;

	@Field(() => String)
	hotelName!: string;

	@Field(() => String)
	hotelDescription!: string;

	@Field(() => String)
	hotelCountry!: string;

	@Field(() => String)
	hotelCity!: string;

	@Field(() => String)
	hotelAddress!: string;

	@Field(() => String)
	hotelTimezone!: string;

	@Field(() => HotelType)
	hotelType!: HotelType;

	@Field(() => HotelStatus)
	hotelStatus!: HotelStatus;

	@Field(() => [String])
	hotelImages!: string[];

	@Field(() => [HotelAmenity])
	hotelAmenities!: HotelAmenity[];

	@Field(() => Float)
	hotelRating!: number;

	@Field(() => Int)
	hotelReviews!: number;

	@Field(() => Int)
	hotelViews!: number;

	@Field(() => Int)
	hotelLikes!: number;

	@Field(() => Date)
	createdAt!: Date;

	@Field(() => Date)
	updatedAt!: Date;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;
}

@ObjectType()
export class Hotels {
	@Field(() => [Hotel])
	list!: Hotel[];

	@Field(() => [TotalCounter])
	metaCounter!: TotalCounter[];
}
