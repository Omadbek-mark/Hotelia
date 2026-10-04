import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsMongoId, IsNotEmpty, Max, Min, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { ObjectId } from 'mongoose';

@InputType()
class FollowSearch {
	@ValidateIf((_, value) => value !== undefined)
	@IsMongoId()
	@Field(() => String, { nullable: true })
	followingId?: ObjectId;

	@ValidateIf((_, value) => value !== undefined)
	@IsMongoId()
	@Field(() => String, { nullable: true })
	followerId?: ObjectId;
}

@InputType()
export class FollowInquiry {
	@IsInt()
	@Min(1)
	@Max(1000000)
	@Field(() => Int)
	page!: number;

	@IsInt()
	@Min(1)
	@Max(100)
	@Field(() => Int)
	limit!: number;

	@IsNotEmpty()
	@ValidateNested()
	@Type(() => FollowSearch)
	@Field(() => FollowSearch)
	search!: FollowSearch;
}
