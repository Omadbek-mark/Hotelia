import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import RoomSchema from '../../schemas/Room.model';
import BookingSchema from '../../schemas/Booking.model';
import { AuthModule } from '../auth/auth.module';
import { HotelModule } from '../hotel/hotel.module';
import { RoomResolver } from './room.resolver';
import { RoomService } from './room.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Room', schema: RoomSchema },
			{ name: 'Booking', schema: BookingSchema },
		]),
		AuthModule,
		HotelModule,
	],
	providers: [RoomService, RoomResolver],
	exports: [RoomService],
})
export class RoomModule {}
