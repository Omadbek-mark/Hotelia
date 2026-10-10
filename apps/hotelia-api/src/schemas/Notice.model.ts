import mongoose, { Schema } from 'mongoose';
import { NoticeCategory, NoticeStatus } from '../libs/enums/notice.enum';

const NoticeSchema = new Schema(
	{
		noticeCategory: {
			type: String,
			enum: NoticeCategory,
			required: true,
		},

		noticeStatus: {
			type: String,
			enum: NoticeStatus,
			default: NoticeStatus.ACTIVE,
		},

		noticeTitle: {
			type: String,
			required: true,
		},

		requestId: { type: String },
		noticeResponse: { type: String, maxlength: 2000 },
		respondedAt: { type: Date },
		noticeContent: {
			type: String,
			required: true,
		},
		
		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'notices' },
);

NoticeSchema.index({ memberId: 1, requestId: 1 }, { unique: true, partialFilterExpression: { requestId: { $type: 'string' } } });

export default NoticeSchema;
