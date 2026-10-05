import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import BoConfigSchema from '../../schemas/BoConfig.model';
import { AuthModule } from '../auth/auth.module';
import { BoConfigService } from './bo-config.service';
import { BoConfigResolver } from './bo-config.resolver';

@Module({
	imports: [AuthModule, MongooseModule.forFeature([{ name: 'BoConfig', schema: BoConfigSchema }])],
	providers: [BoConfigService, BoConfigResolver],
})
export class BoConfigModule {}
