import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HotelModule } from '../hotel/hotel.module';
import { RoomModule } from '../room/room.module';
import { ChatbotService } from './chatbot.service';
import { ChatbotResolver } from './chatbot.resolver';
@Module({ imports: [ConfigModule, HotelModule, RoomModule], providers: [ChatbotService, ChatbotResolver] })
export class ChatbotModule {}
