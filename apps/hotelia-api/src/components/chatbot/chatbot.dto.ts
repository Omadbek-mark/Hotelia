import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsString, Length, Matches, ValidateNested } from 'class-validator';

@InputType()
export class ChatbotTurn {
	@Field() @IsIn(['user', 'model']) role!: string;
	@Field() @IsString() @Length(1, 4000) @Matches(/\S/) text!: string;
}
@InputType()
export class ChatbotInput {
	@Field() @IsString() @Length(1, 1000) @Matches(/\S/) message!: string;
	@Field(() => [ChatbotTurn], { defaultValue: [] })
	@IsArray()
	@ArrayMaxSize(10)
	@ValidateNested({ each: true })
	@Type(() => ChatbotTurn)
	history: ChatbotTurn[] = [];
}
@ObjectType()
export class ChatbotSource {
	@Field() title!: string;
	@Field() url!: string;
}
@ObjectType()
export class ChatbotReply {
	@Field() answer!: string;
	@Field(() => [ChatbotSource]) sources!: ChatbotSource[];
}
