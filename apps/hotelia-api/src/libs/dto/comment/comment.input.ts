import { Field, InputType, Int } from '@nestjs/graphql';
import {
	IsEnum,
	IsIn,
	IsInt,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	Length,
	Max,
	Min,
	ValidateIf,
	ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import type { ObjectId } from 'mongoose';
import { CommentGroup } from '../../enums/comment.enum';
import { Direction } from '../../enums/common.enum';
import { availableCommentSorts } from '../../config';

@InputType()
export class OwnerReviewsInquiry {
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

	@ValidateIf((_, value) => value !== undefined)
	@IsMongoId()
	@Field(() => String, { nullable: true })
	hotelId?: string;
}

@InputType()
export class CommentInput {
	@ValidateIf((input, value) => input.commentGroup === CommentGroup.HOTEL || value !== undefined)
	@IsMongoId()
	@Field(() => String, { nullable: true })
	bookingId?: string;

	@ValidateIf((input, value) => input.commentGroup === CommentGroup.HOTEL || value !== undefined)
	@IsInt()
	@Min(1)
	@Max(5)
	@Field(() => Int, { nullable: true })
	rating?: number;

	@IsEnum(CommentGroup)
	@Field(() => CommentGroup)
	commentGroup!: CommentGroup;

	@IsNotEmpty()
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@Length(1, 100)
	@Field(() => String)
	commentContent!: string;

	@IsMongoId()
	@Field(() => String)
	commentRefId!: ObjectId;
}

@InputType()
class CISearch {
	@IsMongoId()
	@Field(() => String)
	commentRefId!: ObjectId;

	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(CommentGroup)
	@Field(() => CommentGroup, { nullable: true })
	commentGroup?: CommentGroup;
}

@InputType()
export class CommentsInquiry {
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

	@IsOptional()
	@IsIn(availableCommentSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@IsEnum(Direction)
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@ValidateNested()
	@Type(() => CISearch)
	@Field(() => CISearch)
	search!: CISearch;
}
