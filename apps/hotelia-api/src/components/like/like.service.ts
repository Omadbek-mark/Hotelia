import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { Connection, Model, Types } from 'mongoose';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { LikeGroup } from '../../libs/enums/like.enum';

import { FavoriteResult } from '../../libs/dto/like/favorite-result';
import { FavoritesInquiry } from '../../libs/dto/like/favorites.inquiry';
import { Hotel, Hotels } from '../../libs/dto/hotel/hotel';
import { HotelStatus } from '../../libs/enums/hotel.enum';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';

@Injectable()
export class LikeService {
	constructor(
		@InjectModel('Like') private readonly likeModel: Model<Like>,
		@InjectModel('Hotel') private readonly hotelModel: Model<Hotel>,
		@InjectConnection() private readonly connection: Connection,
	) {}

	public async toggleLike(input: LikeInput): Promise<number> {
		const search: T = { memberId: input.memberId, likeRefId: input.likeRefId, likeGroup: input.likeGroup },
			exist = await this.likeModel.findOne(search).exec();
		let modifier = 1;

		if (exist) {
			await this.likeModel.findOneAndDelete(search).exec();
			modifier = -1;
		} else {
			try {
				await this.likeModel.create(input);
			} catch (err) {
				console.log('Error, Service.model:', err instanceof Error ? err.message : err);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}

		console.log(`- Like modifier ${modifier} -`);
		return modifier;
	}

	public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
		const { memberId, likeRefId, likeGroup } = input;
		const result = await this.likeModel.findOne({ memberId, likeRefId, likeGroup }).exec();
		return result ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }] : [];
	}

	public async setHotelFavorite(
		memberId: Types.ObjectId,
		hotelId: Types.ObjectId,
		favorite: boolean,
	): Promise<FavoriteResult> {
		// A simultaneous first save can hit the unique index. Retry once to read the existing favorite.
		for (let attempt = 0; ; attempt++) {
			try {
				return await this.connection.transaction(async (session) => {
					const hotelFilter = { _id: hotelId, ...(favorite ? { hotelStatus: HotelStatus.ACTIVE } : {}) };
					let hotel = await this.hotelModel.findOne(hotelFilter).session(session).lean().exec();
					if (!hotel) throw new NotFoundException(Message.NO_DATA_FOUND);
					let modifier = 0;
					if (favorite) {
						const result = await this.likeModel.updateOne(
							{ memberId, likeRefId: hotelId, likeGroup: LikeGroup.HOTEL },
							{
								$setOnInsert: {
									memberId,
									likeRefId: hotelId,
									likeGroup: LikeGroup.HOTEL,
									createdAt: new Date(),
									updatedAt: new Date(),
								},
							},
							{ upsert: true, session, timestamps: false },
						);
						modifier = result.upsertedCount ? 1 : 0;
					} else {
						const result = await this.likeModel
							.deleteOne({ memberId, likeRefId: hotelId, likeGroup: LikeGroup.HOTEL })
							.session(session)
							.exec();
						modifier = result.deletedCount ? -1 : 0;
					}
					if (modifier) {
						hotel = await this.hotelModel
							.findOneAndUpdate(
								hotelFilter,
								{ $inc: { hotelLikes: modifier } },
								{ new: true, session, timestamps: false },
							)
							.lean()
							.exec();
						if (!hotel) throw new NotFoundException(Message.NO_DATA_FOUND);
					}
					return { hotelId, isFavorite: favorite, hotelLikes: hotel.hotelLikes };
				});
			} catch (error) {
				if (favorite && attempt === 0 && (error as { code?: number })?.code === 11000) continue;
				throw error;
			}
		}
	}

	public async attachFavoriteStatus(hotels: Hotel[], memberId?: Types.ObjectId | null): Promise<void> {
		const favorites =
			memberId && hotels.length
				? await this.likeModel
						.find({ memberId, likeGroup: LikeGroup.HOTEL, likeRefId: { $in: hotels.map((hotel) => hotel._id) } })
						.select('likeRefId')
						.lean()
						.exec()
				: [];
		const ids = new Set(favorites.map((favorite) => String(favorite.likeRefId)));
		for (const hotel of hotels) hotel.isFavorite = ids.has(String(hotel._id));
	}

	public async getFavoriteHotels(memberId: Types.ObjectId, input: FavoritesInquiry): Promise<Hotels> {
		const [result] = await this.likeModel
			.aggregate<Hotels>([
				{ $match: { memberId, likeGroup: LikeGroup.HOTEL } },
				{ $sort: { createdAt: -1, _id: -1 } },
				{
					$lookup: {
						from: 'hotels',
						localField: 'likeRefId',
						foreignField: '_id',
						as: 'hotel',
						pipeline: [{ $match: { hotelStatus: HotelStatus.ACTIVE } }],
					},
				},
				{ $unwind: '$hotel' },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							{ $replaceRoot: { newRoot: '$hotel' } },
							{ $set: { isFavorite: true } },
							{
								$lookup: {
									from: 'members',
									localField: 'ownerId',
									foreignField: '_id',
									as: 'memberData',
									pipeline: [
										{ $match: { memberStatus: MemberStatus.ACTIVE, memberType: MemberType.HOTEL_OWNER } },
										{ $project: { _id: 1, memberNick: 1, memberImage: 1, memberDesc: 1 } },
									],
								},
							},
							{ $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		return result ?? { list: [], metaCounter: [] };
	}
}
