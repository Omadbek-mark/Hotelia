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
import {
	AdminSupportCreate,
	AdminSupportInquiry,
	AdminSupportNotice,
	AdminSupportNotices,
	AdminSupportReply,
	AdminSupportUpdate,
} from '../../libs/dto/support/support-admin';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
const validation = () => new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
@Resolver()
export class SupportResolver {
	constructor(private readonly support: SupportService) {}
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => AdminSupportNotices)
	getSupportByAdmin(@Args('input', validation()) input: AdminSupportInquiry): Promise<AdminSupportNotices> {
		return this.support.getSupportByAdmin(input);
	}
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => AdminSupportNotice)
	createSupportByAdmin(
		@AuthMember('_id') memberId: Types.ObjectId,
		@Args('input', validation()) input: AdminSupportCreate,
	): Promise<AdminSupportNotice> {
		return this.support.createSupportByAdmin(memberId, input);
	}
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => AdminSupportNotice)
	updateSupportByAdmin(@Args('input', validation()) input: AdminSupportUpdate): Promise<AdminSupportNotice> {
		return this.support.updateSupportByAdmin(input);
	}
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => AdminSupportNotice)
	replySupportByAdmin(@Args('input', validation()) input: AdminSupportReply): Promise<AdminSupportNotice> {
		return this.support.replySupportByAdmin(input);
	}
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
