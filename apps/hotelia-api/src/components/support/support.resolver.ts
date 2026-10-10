import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Types } from 'mongoose';
import {
	MyInquiriesInquiry,
	SupportInquiryInput,
	SupportNotice,
	SupportNotices,
	SupportNoticesInquiry,
} from '../../libs/dto/support/support';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { SupportService } from './support.service';
const validation = () => new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
@Resolver()
export class SupportResolver {
	constructor(private readonly support: SupportService) {}
	@Query(() => SupportNotices)
	getSupportNotices(@Args('input', validation()) input: SupportNoticesInquiry): Promise<SupportNotices> {
		return this.support.getSupportNotices(input);
	}
	@UseGuards(AuthGuard)
	@Query(() => SupportNotices)
	getMyInquiries(
		@AuthMember('_id') memberId: Types.ObjectId,
		@Args('input', validation()) input: MyInquiriesInquiry,
	): Promise<SupportNotices> {
		return this.support.getMyInquiries(memberId, input);
	}
	@UseGuards(AuthGuard)
	@Mutation(() => SupportNotice)
	createSupportInquiry(
		@AuthMember('_id') memberId: Types.ObjectId,
		@Args('input', validation()) input: SupportInquiryInput,
	): Promise<SupportNotice> {
		return this.support.createSupportInquiry(memberId, input);
	}
}
