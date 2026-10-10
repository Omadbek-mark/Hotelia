import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
	MyInquiriesInquiry,
	SupportInquiryInput,
	SupportNotice,
	SupportNotices,
	SupportNoticesInquiry,
} from '../../libs/dto/support/support';
import { NoticeCategory, NoticeStatus } from '../../libs/enums/notice.enum';

@Injectable()
export class SupportService {
	constructor(@InjectModel('Notice') private readonly notices: Model<SupportNotice>) {}
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
					{ upsert: true, new: true, setDefaultsOnInsert: true },
				)
				.lean()
				.exec();
		} catch (error) {
			if ((error as { code?: number }).code !== 11000) throw error;
			result = await this.notices.findOne(filter).lean().exec();
		}
		if (!result || result.noticeTitle !== input.noticeTitle || result.noticeContent !== input.noticeContent)
			throw new ConflictException('This request was already submitted with different content.');
		return result;
	}
}
