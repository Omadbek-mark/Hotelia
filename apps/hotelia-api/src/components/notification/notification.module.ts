import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import NotificationSchema from '../../schemas/Notification.model';
import HotelSchema from '../../schemas/Hotel.model';
import MemberSchema from '../../schemas/Member.model';
import { AuthModule } from '../auth/auth.module';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
@Module({
	imports: [
		AuthModule,
		MongooseModule.forFeature([
			{ name: 'Notification', schema: NotificationSchema },
			{ name: 'Hotel', schema: HotelSchema },
			{ name: 'Member', schema: MemberSchema },
		]),
	],
	providers: [NotificationService, NotificationResolver],
	exports: [NotificationService],
})
export class NotificationModule {}
