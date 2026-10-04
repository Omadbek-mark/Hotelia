import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsMongoId, IsString, Length, ValidateIf } from 'class-validator';
import { BoardArticleStatus } from '../../enums/board-article.enum';
import { Transform } from 'class-transformer';
import type { ObjectId } from 'mongoose';

@InputType()
export class BoardArticleUpdate {
	@IsMongoId()
	@Field(() => String)
	_id!: ObjectId;

	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(BoardArticleStatus)
	@Field(() => BoardArticleStatus, { nullable: true })
	articleStatus?: BoardArticleStatus;

	@ValidateIf((_, value) => value !== undefined)
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@Length(3, 50)
	@Field(() => String, { nullable: true })
	articleTitle?: string;

	@ValidateIf((_, value) => value !== undefined)
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@Length(3, 250)
	@Field(() => String, { nullable: true })
	articleContent?: string;

	@ValidateIf((_, value) => value !== undefined)
	@IsString()
	@Length(0, 2048)
	@Field(() => String, { nullable: true })
	articleImage?: string;
}
