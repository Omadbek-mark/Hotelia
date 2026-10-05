import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import NotificationSchema from '../../schemas/Notification.model';
import HotelSchema from '../../schemas/Hotel.model';
import { AuthModule } from '../auth/auth.module';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
@Module({
	imports: [
		AuthModule,
		MongooseModule.forFeature([
			{ name: 'Notification', schema: NotificationSchema },
			{ name: 'Hotel', schema: HotelSchema },
		]),
	],
	providers: [NotificationService, NotificationResolver],
	exports: [NotificationService],
})
export class NotificationModule {}
