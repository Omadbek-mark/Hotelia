import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsMongoId, Length, Max, Min, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { CommentStatus } from '../../enums/comment.enum';
import type { ObjectId } from 'mongoose';

@InputType()
export class CommentUpdate {
	@IsMongoId()
	@Field(() => String)
	_id!: ObjectId;

	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(CommentStatus)
	@Field(() => CommentStatus, { nullable: true })
	commentStatus?: CommentStatus;

	@ValidateIf((_, value) => value !== undefined)
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@Length(1, 100)
	@Field(() => String, { nullable: true })
	commentContent?: string;

	@ValidateIf((_, value) => value !== undefined)
	@IsInt()
	@Min(1)
	@Max(5)
	@Field(() => Int, { nullable: true })
	rating?: number;
}
