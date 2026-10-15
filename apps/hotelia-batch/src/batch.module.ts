import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import HotelSchema from 'apps/hotelia-api/src/schemas/Hotel.model';
import MemberSchema from 'apps/hotelia-api/src/schemas/Member.model';
import CommentSchema from 'apps/hotelia-api/src/schemas/Comment.model';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';

@Module({
	imports: [
		ConfigModule.forRoot(),
		DatabaseModule,
		ScheduleModule.forRoot(),
		MongooseModule.forFeature([{ name: 'Hotel', schema: HotelSchema }]),
		MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
		MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
	],
	controllers: [BatchController],
	providers: [BatchService],
})
export class BatchModule {}
