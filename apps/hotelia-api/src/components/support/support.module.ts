import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import NoticeSchema from '../../schemas/Notice.model';
import { AuthModule } from '../auth/auth.module';
import { SupportResolver } from './support.resolver';
import { SupportService } from './support.service';
@Module({
	imports: [AuthModule, MongooseModule.forFeature([{ name: 'Notice', schema: NoticeSchema }])],
	providers: [SupportResolver, SupportService],
})
export class SupportModule {}
