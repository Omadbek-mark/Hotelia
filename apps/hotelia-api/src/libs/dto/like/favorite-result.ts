import { Field, Int, ObjectType } from '@nestjs/graphql';
import type { Types } from 'mongoose';

@ObjectType()
export class FavoriteResult {
	@Field(() => String)
	hotelId!: Types.ObjectId;

	@Field(() => Boolean)
	isFavorite!: boolean;

	@Field(() => Int)
	hotelLikes!: number;
}
