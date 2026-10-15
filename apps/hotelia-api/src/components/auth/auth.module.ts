import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthResolver } from './auth.resolver';
import SessionSchema from '../../schemas/Session.model';
import MemberSchema from '../../schemas/Member.model';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }, { name: 'Session', schema: SessionSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('SECRET_TOKEN');
        if (!secret?.trim() || secret === 'undefined') throw new Error('SECRET_TOKEN must be configured');
        return { secret, signOptions: { expiresIn: '15m' as const } };
      },
    }),
  ],
  providers: [AuthService, AuthResolver],
  exports: [AuthService],
})
export class AuthModule {}
