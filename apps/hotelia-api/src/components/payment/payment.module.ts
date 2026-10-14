import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import PaymentCardSchema from '../../schemas/PaymentCard.model';
import { AuthModule } from '../auth/auth.module';
import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';

@Module({
	imports: [AuthModule, MongooseModule.forFeature([{ name: 'PaymentCard', schema: PaymentCardSchema }])],
	providers: [PaymentService, PaymentResolver],
})
export class PaymentModule {}
