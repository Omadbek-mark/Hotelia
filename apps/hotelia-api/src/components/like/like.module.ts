import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import LikeSchema from '../../schemas/Like.model';
import { LikeService } from './like.service';
import HotelSchema from '../../schemas/Hotel.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Hotel', schema: HotelSchema },
			{
				name: 'Like',
				schema: LikeSchema,
			},
		]),
	],
	providers: [LikeService],
	exports: [LikeService],
})
export class LikeModule {}
