import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import NoticeSchema from '../../schemas/Notice.model';
import { AuthModule } from '../auth/auth.module';
import { SupportResolver } from './support.resolver';
import { SupportService } from './support.service';
import { NotificationModule } from '../notification/notification.module';
@Module({
	imports: [AuthModule, NotificationModule, MongooseModule.forFeature([{ name: 'Notice', schema: NoticeSchema }])],
	providers: [SupportResolver, SupportService],
})
export class SupportModule {}
