import { Schema } from 'mongoose';
import { CommentGroup, CommentStatus } from '../libs/enums/comment.enum';

const CommentSchema = new Schema(
	{
		bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', immutable: true },
		rating: { type: Number, min: 1, max: 5, validate: Number.isInteger },
		commentStatus: {
			type: String,
			enum: CommentStatus,
			default: CommentStatus.ACTIVE,
		},

		commentGroup: {
			type: String,
			enum: CommentGroup,
			required: true,
		},

		commentContent: {
			type: String,
			required: true,
		},

		commentRefId: {
			type: Schema.Types.ObjectId,
			required: true,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
	},
	{ timestamps: true, collection: 'comments' },
);

CommentSchema.index(
	{ bookingId: 1 },
	{ unique: true, partialFilterExpression: { commentGroup: CommentGroup.HOTEL, bookingId: { $type: 'objectId' } } },
);
CommentSchema.index({ commentRefId: 1, commentStatus: 1, createdAt: -1 });
export default CommentSchema;
