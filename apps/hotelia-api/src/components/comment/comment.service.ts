import {
	BadRequestException,
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, ObjectId, PipelineStage } from 'mongoose';
import { Booking } from '../../libs/dto/booking/booking';
import { Hotel } from '../../libs/dto/hotel/hotel';
import { BookingStatus } from '../../libs/enums/booking.enum';
import { HotelStatus } from '../../libs/enums/hotel.enum';
import { MemberService } from '../member/member.service';
import { PropertyService } from '../property/property.service';
import { BoardArticleService } from '../board-article/board-article.service';
import { CommentInput, CommentsInquiry, OwnerReviewsInquiry } from '../../libs/dto/comment/comment.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { Comment, Comments } from '../../libs/dto/comment/comment';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { T } from '../../libs/types/common';

@Injectable()
export class CommentService {
	constructor(
		@InjectModel('Comment') private readonly commentModel: Model<Comment>,
		private readonly memberService: MemberService,
		private readonly propertyService: PropertyService,
		private readonly boardArticleService: BoardArticleService,
		@InjectModel('Booking') private readonly bookingModel: Model<Booking>,
		@InjectModel('Hotel') private readonly hotelModel: Model<Hotel>,
		@InjectConnection() private readonly connection: Connection,
	) {}

	public async createComment(memberId: ObjectId, input: CommentInput): Promise<Comment> {
		if (input.commentGroup === CommentGroup.HOTEL) {
			if (!Number.isInteger(input.rating) || input.rating! < 1 || input.rating! > 5 || !input.bookingId) {
				throw new BadRequestException('Hotel reviews require a bookingId and rating from 1 to 5');
			}
			const hotelId = shapeIntoMongoObjectId(input.commentRefId);
			const bookingId = shapeIntoMongoObjectId(input.bookingId);
			const booking = await this.bookingModel
				.findOne({ _id: bookingId, memberId, hotelId, bookingStatus: BookingStatus.COMPLETED })
				.lean()
				.exec();
			if (!booking) throw new NotFoundException('Completed booking not found for this member and hotel');
			try {
				return await this.writeHotelReview(
					hotelId,
					async (session) => {
						const [review] = await this.commentModel.create(
							[
								{
									memberId,
									commentRefId: hotelId,
									commentGroup: CommentGroup.HOTEL,
									bookingId,
									rating: input.rating,
									commentContent: input.commentContent,
									commentStatus: CommentStatus.ACTIVE,
								},
							],
							{ session },
						);
						return review;
					},
					true,
				);
			} catch (error) {
				if ((error as { code?: number })?.code === 11000)
					throw new ConflictException('This booking already has a review');
				throw error;
			}
		}
		if (input.rating !== undefined || input.bookingId !== undefined)
			throw new BadRequestException('Rating and bookingId are only for hotel reviews');

		let result: Comment | null = null;
		try {
			result = await this.commentModel.create({
				memberId,
				commentGroup: input.commentGroup,
				commentRefId: input.commentRefId,
				commentContent: input.commentContent,
			});
		} catch (err) {
			console.log('Error, Service.model:', err);
			throw new BadRequestException(Message.CREATE_FAILED);
		}

		switch (input.commentGroup) {
			case CommentGroup.PROPERTY:
				await this.propertyService.propertyStatsEditor({
					_id: input.commentRefId,
					targetKey: 'propertyComments',
					modifier: 1,
				});
				break;
			case CommentGroup.ARTICLE:
				await this.boardArticleService.boardArticleStatsEditor({
					_id: input.commentRefId,
					targetKey: 'articleComments',
					modifier: 1,
				});
				break;
			case CommentGroup.MEMBER:
				await this.memberService.memberStatsEditor({
					_id: input.commentRefId,
					targetKey: 'memberComments',
					modifier: 1,
				});
				break;
		}

		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);
		return result;
	}

	public async updateComment(memberId: ObjectId, input: CommentUpdate): Promise<Comment> {
		const { _id } = input;
		const current = await this.commentModel
			.findOne({ _id, memberId, commentStatus: CommentStatus.ACTIVE })
			.lean()
			.exec();
		if (!current) throw new NotFoundException(Message.NO_DATA_FOUND);
		const changes: Partial<Comment> = {};
		if (input.commentContent !== undefined) changes.commentContent = input.commentContent;
		if (input.commentStatus !== undefined) changes.commentStatus = input.commentStatus;
		if (current.commentGroup === CommentGroup.HOTEL) {
			if (input.rating !== undefined) changes.rating = input.rating;
			if (!Object.keys(changes).length) throw new BadRequestException(Message.BAD_REQUEST);
			return await this.writeHotelReview(current.commentRefId, async (session) => {
				const review = await this.commentModel
					.findOneAndUpdate(
						{ _id, memberId, commentGroup: CommentGroup.HOTEL, commentStatus: CommentStatus.ACTIVE },
						{ $set: changes },
						{ new: true, runValidators: true, session },
					)
					.exec();
				if (!review) throw new NotFoundException(Message.NO_DATA_FOUND);
				return review;
			});
		}
		if (input.rating !== undefined) throw new BadRequestException('Rating is only for hotel reviews');
		const result = await this.commentModel.findOneAndUpdate(
			{
				_id: _id,
				memberId: memberId,
				commentStatus: CommentStatus.ACTIVE,
			},
			{ $set: changes },
			{
				new: true,
				runValidators: true,
			},
		);
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async getComments(memberId: ObjectId, input: CommentsInquiry): Promise<Comments> {
		const { commentRefId, commentGroup } = input.search;
		if (commentGroup === CommentGroup.HOTEL) {
			const hotel = await this.hotelModel.exists({ _id: commentRefId, hotelStatus: HotelStatus.ACTIVE }).exec();
			if (!hotel) throw new NotFoundException(Message.NO_DATA_FOUND);
		}
		const match: T = {
			commentRefId,
			commentStatus: CommentStatus.ACTIVE,
			commentGroup: commentGroup ?? { $ne: CommentGroup.HOTEL },
		};
		const sort: T = {
			[input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
			_id: input?.direction ?? Direction.DESC,
		};

		return this.getCommentList([{ $match: match }, { $sort: sort }], input);
	}

	public async getOwnerReviews(memberId: ObjectId, input: OwnerReviewsInquiry): Promise<Comments> {
		const match: T = { commentGroup: CommentGroup.HOTEL, commentStatus: CommentStatus.ACTIVE };
		if (input.hotelId) {
			const hotelId = shapeIntoMongoObjectId(input.hotelId);
			if (!(await this.hotelModel.exists({ _id: hotelId, ownerId: memberId }).exec()))
				throw new NotFoundException(Message.NO_DATA_FOUND);
			match.commentRefId = hotelId;
		}
		return this.getCommentList(
			[
				{ $match: match },
				{
					$lookup: {
						from: 'hotels',
						localField: 'commentRefId',
						foreignField: '_id',
						as: 'ownerHotel',
						pipeline: [{ $match: { ownerId: memberId } }, { $project: { _id: 1 } }],
					},
				},
				{ $match: { 'ownerHotel.0': { $exists: true } } },
				{ $unset: 'ownerHotel' },
				{ $sort: { createdAt: -1, _id: -1 } },
			],
			input,
		);
	}

	private async getCommentList(stages: PipelineStage[], input: { page: number; limit: number }): Promise<Comments> {
		const result: Comments[] = await this.commentModel.aggregate([
			...stages,
			{
				$facet: {
					list: [
						{ $skip: (input.page - 1) * input.limit },
						{ $limit: input.limit },
						{
							$lookup: {
								from: 'members',
								localField: 'memberId',
								foreignField: '_id',
								as: 'memberData',
								pipeline: [{ $project: { _id: 1, memberNick: 1, memberImage: 1, memberDesc: 1 } }],
							},
						},
						{ $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
					],
					metaCounter: [{ $count: 'total' }],
				},
			},
		]);
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async removeCommentByAdmin(input: ObjectId): Promise<Comment> {
		const current = await this.commentModel.findById(input).lean().exec();
		if (current?.commentGroup === CommentGroup.HOTEL) {
			return await this.writeHotelReview(current.commentRefId, async (session) => {
				const review = await this.commentModel
					.findOneAndUpdate(
						{ _id: input, commentGroup: CommentGroup.HOTEL, commentStatus: CommentStatus.ACTIVE },
						{ $set: { commentStatus: CommentStatus.DELETE } },
						{ new: true, session },
					)
					.exec();
				if (!review) throw new NotFoundException(Message.NO_DATA_FOUND);
				return review;
			});
		}
		const result = await this.commentModel.findByIdAndDelete(input);
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		switch (result.commentGroup) {
			case CommentGroup.PROPERTY:
				await this.propertyService.propertyStatsEditor({
					_id: result.commentRefId,
					targetKey: 'propertyComments',
					modifier: -1,
				});
				break;
			case CommentGroup.ARTICLE:
				await this.boardArticleService.boardArticleStatsEditor({
					_id: result.commentRefId,
					targetKey: 'articleComments',
					modifier: -1,
				});
				break;
			case CommentGroup.MEMBER:
				await this.memberService.memberStatsEditor({
					_id: result.commentRefId,
					targetKey: 'memberComments',
					modifier: -1,
				});
				break;
		}

		return result;
	}

	private async writeHotelReview(
		hotelId: ObjectId,
		write: (session: ClientSession) => Promise<Comment>,
		activeOnly = false,
	): Promise<Comment> {
		return await this.connection.transaction(async (session) => {
			// Reuse the existing internal hotel write counter to serialize rating recalculation.
			const hotel = await this.hotelModel
				.findOneAndUpdate(
					{ _id: hotelId, ...(activeOnly ? { hotelStatus: HotelStatus.ACTIVE } : {}) },
					{ $inc: { bookingVersion: 1 } },
					{ new: true, session, timestamps: false },
				)
				.exec();
			if (!hotel) throw new NotFoundException(Message.NO_DATA_FOUND);
			const result = await write(session);
			const [stats] = await this.commentModel
				.aggregate<{ count: number; rating: number }>([
					{ $match: { commentRefId: hotelId, commentGroup: CommentGroup.HOTEL, commentStatus: CommentStatus.ACTIVE } },
					{ $group: { _id: null, count: { $sum: 1 }, rating: { $avg: '$rating' } } },
				])
				.session(session)
				.exec();
			await this.hotelModel
				.updateOne(
					{ _id: hotelId },
					{ $set: { hotelReviews: stats?.count ?? 0, hotelRating: stats?.rating ?? 0 } },
					{ session, timestamps: false },
				)
				.exec();
			return result;
		});
	}
}
