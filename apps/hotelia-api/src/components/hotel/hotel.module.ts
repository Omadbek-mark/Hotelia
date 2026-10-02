import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import HotelSchema from '../../schemas/Hotel.model';
import { MemberModule } from '../member/member.module';
import { AuthModule } from '../auth/auth.module';
import { HotelResolver } from './hotel.resolver';
import { HotelService } from './hotel.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Hotel', schema: HotelSchema }]), AuthModule, MemberModule],
  providers: [HotelResolver, HotelService],
  exports: [HotelService],
})
export class HotelModule {}
