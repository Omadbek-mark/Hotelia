import { Field, ObjectType } from '@nestjs/graphql';
import type { Types } from 'mongoose';

@ObjectType()
export class MemberPublic {
	@Field(() => String)
	_id!: Types.ObjectId;

	@Field(() => String)
	memberNick!: string;

	@Field(() => String)
	memberImage!: string;

	@Field(() => String, { nullable: true })
	memberDesc?: string;
}
