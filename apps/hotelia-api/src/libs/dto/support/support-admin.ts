import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsMongoId, IsString, Length, Max, Min, ValidateIf } from 'class-validator';
import { Types } from 'mongoose';
import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';
import { TotalCounter } from '../member/member';
import { MyInquiriesInquiry, SupportInquiryInput, SupportNotice } from './support';

@ObjectType()
export class AdminSupportNotice extends SupportNotice {
	@Field(() => String) memberId!: Types.ObjectId;
	@Field(() => Int) noticeRevision!: number;
}
@ObjectType()
export class AdminSupportNotices {
	@Field(() => [AdminSupportNotice]) list!: AdminSupportNotice[];
	@Field(() => [TotalCounter]) metaCounter!: TotalCounter[];
}
@InputType()
export class AdminSupportInquiry extends MyInquiriesInquiry {
	@IsEnum(NoticeCategory) @Field(() => NoticeCategory) noticeCategory!: NoticeCategory;
	@ValidateIf((_, value) => value !== undefined)
	@IsEnum(NoticeStatus)
	@Field(() => NoticeStatus, { nullable: true })
	noticeStatus?: NoticeStatus;
}
@InputType()
export class AdminSupportCreate extends SupportInquiryInput {
	@IsIn([NoticeCategory.FAQ, NoticeCategory.TERMS, NoticeCategory.ANNOUNCEMENT])
	@Field(() => NoticeCategory)
	noticeCategory!: NoticeCategory;
	@IsIn([NoticeStatus.HOLD, NoticeStatus.ACTIVE])
	@Field(() => NoticeStatus)
	noticeStatus!: NoticeStatus;
}
@InputType()
export class AdminSupportUpdate {
	@IsMongoId() @Field(() => String) _id!: string;
	@IsInt() @Min(0) @Max(1000000000) @Field(() => Int) expectedRevision!: number;
	@IsString()
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@Length(3, 100)
	@Field(() => String)
	noticeTitle!: string;
	@IsString()
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@Length(10, 2000)
	@Field(() => String)
	noticeContent!: string;
	@IsEnum(NoticeStatus) @Field(() => NoticeStatus) noticeStatus!: NoticeStatus;
}
@InputType()
export class AdminSupportReply {
	@IsMongoId() @Field(() => String) _id!: string;
	@IsInt() @Min(0) @Max(1000000000) @Field(() => Int) expectedRevision!: number;
	@IsString()
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@Length(10, 2000)
	@Field(() => String)
	noticeResponse!: string;
}
