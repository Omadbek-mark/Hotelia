import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEnum, IsString, Length } from 'class-validator';
import { Types } from 'mongoose';
import { BoConfigKey, BoConfigStatus } from '../../enums/bo-config.enum';

@InputType()
export class BoConfigInput {
	@IsEnum(BoConfigKey)
	@Field(() => BoConfigKey)
	configKey!: BoConfigKey;

	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@IsString()
	@Length(1, 2048)
	@Field(() => String)
	value!: string;

	@IsEnum(BoConfigStatus)
	@Field(() => BoConfigStatus)
	configStatus!: BoConfigStatus;
}

@ObjectType()
export class BoConfig {
	@Field(() => String) _id!: Types.ObjectId;
	@Field(() => BoConfigKey) configKey!: BoConfigKey;
	@Field(() => String) value!: string;
	@Field(() => BoConfigStatus) configStatus!: BoConfigStatus;
	@Field(() => Date) createdAt!: Date;
	@Field(() => Date) updatedAt!: Date;
}
