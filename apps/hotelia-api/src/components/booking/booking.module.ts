import { NotificationModule } from '../notification/notification.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import BookingSchema from '../../schemas/Booking.model';
import RoomSchema from '../../schemas/Room.model';
import { HotelModule } from '../hotel/hotel.module';
import { AuthModule } from '../auth/auth.module';
import { BookingService } from './booking.service';
import { BookingResolver } from './booking.resolver';

@Module({
	imports: [
		NotificationModule,
		MongooseModule.forFeature([
			{ name: 'Booking', schema: BookingSchema },
			{ name: 'Room', schema: RoomSchema },
		]),
		AuthModule,
		HotelModule,
	],
	providers: [BookingService, BookingResolver],
	exports: [BookingService],
})
export class BookingModule {}
