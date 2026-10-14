import { ConflictException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { NotificationService } from '../notification/notification.service';
import {
	MyInquiriesInquiry,
	SupportInquiryInput,
	SupportNotice,
	SupportNotices,
	SupportNoticesInquiry,
} from '../../libs/dto/support/support';
import { NoticeCategory, NoticeStatus } from '../../libs/enums/notice.enum';
import {
	AdminSupportCreate,
	AdminSupportInquiry,
	AdminSupportNotices,
	AdminSupportNotice,
	AdminSupportUpdate,
	AdminSupportReply,
} from '../../libs/dto/support/support-admin';

@Injectable()
export class SupportService {
	constructor(
		@InjectModel('Notice') private readonly notices: Model<SupportNotice>,
		@InjectConnection() private readonly connection: Connection,
		private readonly notificationService: NotificationService,
	) {}
	async getSupportByAdmin(input: AdminSupportInquiry): Promise<AdminSupportNotices> {
		const result = await this.list(
			{
				noticeCategory: input.noticeCategory,
				...(input.noticeStatus ? { noticeStatus: input.noticeStatus } : { noticeStatus: { $ne: NoticeStatus.DELETE } }),
			},
			input,
		);
		return { ...result, list: result.list.map((row: any) => ({ ...row, noticeRevision: row.noticeRevision ?? 0 })) };
	}
	async createSupportByAdmin(memberId: Types.ObjectId, input: AdminSupportCreate): Promise<AdminSupportNotice> {
		const filter = { memberId, requestId: input.requestId };
		let result: any;
		try {
			result = await this.notices
				.findOneAndUpdate(
					filter,
					{
						$setOnInsert: {
							...filter,
							noticeCategory: input.noticeCategory,
							noticeStatus: input.noticeStatus,
							noticeTitle: input.noticeTitle,
							noticeContent: input.noticeContent,
						},
					},
					{ upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
				)
				.lean()
				.exec();
		} catch (error) {
			if ((error as { code?: number }).code !== 11000) throw error;
			result = await this.notices.findOne(filter).lean().exec();
		}
		if (
			!result ||
			result.noticeCategory !== input.noticeCategory ||
			result.noticeStatus !== input.noticeStatus ||
			result.noticeTitle !== input.noticeTitle ||
			result.noticeContent !== input.noticeContent
		)
			throw new ConflictException('This request was already submitted with different content.');
		return { ...result, noticeRevision: result.noticeRevision ?? 0 };
	}
	private revisionFilter(expectedRevision: number) {
		return expectedRevision === 0
			? { $or: [{ noticeRevision: 0 }, { noticeRevision: { $exists: false } }] }
			: { noticeRevision: expectedRevision };
	}
	async updateSupportByAdmin(input: AdminSupportUpdate): Promise<AdminSupportNotice> {
		const result: any = await this.notices
			.findOneAndUpdate(
				{
					_id: new Types.ObjectId(input._id),
					noticeCategory: { $in: [NoticeCategory.FAQ, NoticeCategory.TERMS, NoticeCategory.ANNOUNCEMENT] },
					...this.revisionFilter(input.expectedRevision),
				},
				{
					$set: {
						noticeTitle: input.noticeTitle,
						noticeContent: input.noticeContent,
						noticeStatus: input.noticeStatus,
					},
					$inc: { noticeRevision: 1 },
				},
				{ new: true, runValidators: true },
			)
			.lean()
			.exec();
		if (!result) throw new ConflictException('This notice changed or is unavailable. Refresh before saving.');
		return result;
	}
	async replySupportByAdmin(input: AdminSupportReply): Promise<AdminSupportNotice> {
		const result: any = await this.notices
			.findOneAndUpdate(
				{
					_id: new Types.ObjectId(input._id),
					noticeCategory: NoticeCategory.INQUIRY,
					noticeStatus: { $ne: NoticeStatus.DELETE },
					...this.revisionFilter(input.expectedRevision),
				},
				{
					$set: { noticeResponse: input.noticeResponse, respondedAt: new Date(), noticeStatus: NoticeStatus.ACTIVE },
					$inc: { noticeRevision: 1 },
				},
				{ new: true, runValidators: true },
			)
			.lean()
			.exec();
		if (!result) throw new ConflictException('This inquiry changed or is unavailable. Refresh before replying.');
		return result;
	}
	private async list(match: object, input: { page: number; limit: number }): Promise<SupportNotices> {
		const [result] = await this.notices
			.aggregate<SupportNotices>([
				{ $match: match },
				{ $sort: { createdAt: -1, _id: -1 } },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		return result || { list: [], metaCounter: [] };
	}
	getSupportNotices(input: SupportNoticesInquiry): Promise<SupportNotices> {
		return this.list(
			{
				noticeStatus: NoticeStatus.ACTIVE,
				noticeCategory: input.noticeCategory || {
					$in: [NoticeCategory.FAQ, NoticeCategory.TERMS, NoticeCategory.ANNOUNCEMENT],
				},
			},
			input,
		);
	}
	getMyInquiries(memberId: Types.ObjectId, input: MyInquiriesInquiry): Promise<SupportNotices> {
		return this.list(
			{ memberId, noticeCategory: NoticeCategory.INQUIRY, noticeStatus: { $ne: NoticeStatus.DELETE } },
			input,
		);
	}
	async createSupportInquiry(memberId: Types.ObjectId, input: SupportInquiryInput): Promise<SupportNotice> {
		const filter = { memberId, noticeCategory: NoticeCategory.INQUIRY, requestId: input.requestId };
		let result: any;
		try {
			return await this.connection.transaction(async (session) => {
				result = await this.notices
					.findOneAndUpdate(
						filter,
						{
							$setOnInsert: {
								...filter,
								noticeTitle: input.noticeTitle,
								noticeContent: input.noticeContent,
								noticeStatus: NoticeStatus.HOLD,
							},
						},
						{ upsert: true, new: true, setDefaultsOnInsert: true, session },
					)
					.lean()
					.exec();
				if (!result || result.noticeTitle !== input.noticeTitle || result.noticeContent !== input.noticeContent)
					throw new ConflictException('This request was already submitted with different content.');
				await this.notificationService.notifySupportMessage(memberId, result, session);
				return result;
			});
		} catch (error) {
			if ((error as { code?: number }).code !== 11000) throw error;
			result = await this.notices.findOne(filter).lean().exec();
		}
		if (!result || result.noticeTitle !== input.noticeTitle || result.noticeContent !== input.noticeContent)
			throw new ConflictException('This request was already submitted with different content.');
		return result;
	}
}
