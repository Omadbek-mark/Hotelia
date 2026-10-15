import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsString, IsUUID, Length, Max, Min, ValidateIf } from 'class-validator';
import { Types } from 'mongoose';
import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';
import { TotalCounter } from '../member/member';

@ObjectType()
export class SupportNotice {
	@Field(() => String) _id!: Types.ObjectId;
	@Field(() => NoticeCategory) noticeCategory!: NoticeCategory;
	@Field(() => NoticeStatus) noticeStatus!: NoticeStatus;
	@Field(() => String) noticeTitle!: string;
	@Field(() => String) noticeContent!: string;
	@Field(() => String, { nullable: true }) noticeResponse?: string;
	@Field(() => Date, { nullable: true }) respondedAt?: Date;
	@Field(() => Date) createdAt!: Date;
	@Field(() => Date) updatedAt!: Date;
}
@ObjectType()
export class SupportNotices {
	@Field(() => [SupportNotice]) list!: SupportNotice[];
	@Field(() => [TotalCounter]) metaCounter!: TotalCounter[];
}
@InputType()
export class SupportNoticesInquiry {
	@IsInt() @Min(1) @Max(1000000) @Field(() => Int, { defaultValue: 1 }) page: number = 1;
	@IsInt() @Min(1) @Max(50) @Field(() => Int, { defaultValue: 10 }) limit: number = 10;
	@ValidateIf((_, value) => value !== undefined)
	@IsIn([NoticeCategory.FAQ, NoticeCategory.TERMS, NoticeCategory.ANNOUNCEMENT])
	@Field(() => NoticeCategory, { nullable: true })
	noticeCategory?: NoticeCategory;
}
@InputType()
export class MyInquiriesInquiry {
	@IsInt() @Min(1) @Max(1000000) @Field(() => Int, { defaultValue: 1 }) page: number = 1;
	@IsInt() @Min(1) @Max(50) @Field(() => Int, { defaultValue: 10 }) limit: number = 10;
}
@InputType()
export class SupportInquiryInput {
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
	@IsUUID('4') @Field(() => String) requestId!: string;
}
