import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from '../../hotelia-api/src/libs/dto/member/member';
import { Hotel } from '../../hotelia-api/src/libs/dto/hotel/hotel';
import { MemberStatus, MemberType } from '../../hotelia-api/src/libs/enums/member.enum';
import { HotelStatus } from '../../hotelia-api/src/libs/enums/hotel.enum';
import { Comment } from '../../hotelia-api/src/libs/dto/comment/comment';
import { CommentGroup, CommentStatus } from '../../hotelia-api/src/libs/enums/comment.enum';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Hotel') private readonly hotelModel: Model<Hotel>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		@InjectModel('Comment') private readonly commentModel: Model<Comment>,
	) {}

	getHello(): string {
		return 'Welcome Hotelia Batch server!';
	}

	public async batchTopHotels(): Promise<void> {
		const hotels = this.hotelModel.find({ hotelStatus: HotelStatus.ACTIVE }).select('_id').lean().cursor();
		for await (const { _id } of hotels) {
			await this.hotelModel.db.transaction(async (session) => {
				// Serialize with likes/comments so a batch cannot overwrite a newer rank.
				const hotel = await this.hotelModel
					.findOneAndUpdate(
						{ _id, hotelStatus: HotelStatus.ACTIVE },
						{ $inc: { bookingVersion: 1 } },
						{ new: true, session, timestamps: false },
					)
					.lean()
					.exec();
				if (!hotel) return;
				const count = await this.commentModel
					.countDocuments({
						commentRefId: _id,
						commentGroup: CommentGroup.HOTEL,
						commentStatus: CommentStatus.ACTIVE,
					})
					.session(session)
					.exec();
				await this.hotelModel
					.updateOne({ _id }, { $set: { hotelRank: (hotel.hotelLikes ?? 0) + count } }, { session, timestamps: false })
					.exec();
			});
		}
	}

	public async batchTopOwners(): Promise<void> {
		await this.memberModel
			.updateMany(
				{ memberType: MemberType.HOTEL_OWNER, memberStatus: MemberStatus.ACTIVE },
				[
					{
						$set: {
							memberRank: {
								$add: [
									{ $multiply: [{ $ifNull: ['$memberHotels', 0] }, 4] },
									{ $multiply: [{ $ifNull: ['$memberArticles', 0] }, 3] },
									{ $multiply: [{ $ifNull: ['$memberLikes', 0] }, 2] },
									{ $ifNull: ['$memberViews', 0] },
								],
							},
						},
					},
				],
				{ timestamps: false },
			)
			.exec();
	}
}
