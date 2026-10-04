import { Field, InputType, Int } from '@nestjs/graphql';
import {
	IsEnum,
	IsIn,
	IsInt,
	IsMongoId,
	IsNotEmpty,
	IsString,
	Length,
	Max,
	Min,
	ValidateIf,
	ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import type { ObjectId } from 'mongoose';
import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';
import { Direction } from '../../enums/common.enum';
import { availableBoardArticleSorts } from '../../config';

@InputType()
export class BoardArticleInput {
	@IsEnum(BoardArticleCategory)
	@Field(() => BoardArticleCategory)
	articleCategory!: BoardArticleCategory;

	@IsNotEmpty()
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@Length(3, 50)
	@Field(() => String)
	articleTitle!: string;

	@IsNotEmpty()
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@Length(3, 250)
	@Field(() => String)
	articleContent!: string;

	@ValidateIf((_, value) => value !== undefined)
	@IsString()
	@Length(0, 2048)
	@Field(() => String, { nullable: true })
	articleImage?: string;
}

@InputType()
class BAISearch {
	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(BoardArticleCategory)
	@Field(() => BoardArticleCategory, { nullable: true })
	articleCategory?: BoardArticleCategory;

	@ValidateIf((_, value) => value !== undefined)
	@IsString()
	@Length(0, 100)
	@Field(() => String, { nullable: true })
	text?: string;

	@ValidateIf((_, value) => value !== undefined)
	@IsMongoId()
	@Field(() => String, { nullable: true })
	memberId?: ObjectId;
}

@InputType()
export class BoardArticlesInquiry {
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

	@ValidateIf((_, value) => value !== undefined)
	@IsIn(availableBoardArticleSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(Direction)
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@ValidateNested()
	@Type(() => BAISearch)
	@Field(() => BAISearch)
	search!: BAISearch;
}

@InputType()
class ABAISearch {
	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(BoardArticleStatus)
	@Field(() => BoardArticleStatus, { nullable: true })
	articleStatus?: BoardArticleStatus;

	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(BoardArticleCategory)
	@Field(() => BoardArticleCategory, { nullable: true })
	articleCategory?: BoardArticleCategory;
}

@InputType()
export class AllBoardArticlesInquiry {
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

	@ValidateIf((_, value) => value !== undefined)
	@IsIn(availableBoardArticleSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(Direction)
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@ValidateNested()
	@Type(() => ABAISearch)
	@Field(() => ABAISearch)
	search!: ABAISearch;
}
