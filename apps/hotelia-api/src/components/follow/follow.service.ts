import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Connection, Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Follower, Followers, Following, Followings } from '../../libs/dto/follow/follow';
import { Direction, Message } from '../../libs/enums/common.enum';
import { FollowInquiry } from '../../libs/dto/follow/follow.input';
import {
	lookupAuthMemberFollowed,
	lookupAuthMemberLiked,
	lookupFollowerData,
	lookupFollowingData,
} from '../../libs/config';
import { T } from '../../libs/types/common';
import { Member } from '../../libs/dto/member/member';
import { MemberStatus } from '../../libs/enums/member.enum';

@Injectable()
export class FollowService {
	constructor(
		@InjectModel('Follow') private readonly followModel: Model<Follower | Following>,
		private memberService: MemberService,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		@InjectConnection() private readonly connection: Connection,
	) {}

	public async subscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		if (String(followerId) === String(followingId)) throw new BadRequestException(Message.SELF_SUBSCRIPTION_DENIED);
		try {
			return await this.connection.transaction(async (session) => {
				const target = await this.memberModel
					.exists({ _id: followingId, memberStatus: MemberStatus.ACTIVE })
					.session(session)
					.exec();
				if (!target) throw new NotFoundException(Message.NO_DATA_FOUND);
				const [result] = await this.followModel.create([{ followingId, followerId }], { session });
				await this.memberService.memberStatsEditor(
					{ _id: followerId, targetKey: 'memberFollowings', modifier: 1 },
					session,
				);
				await this.memberService.memberStatsEditor(
					{ _id: followingId, targetKey: 'memberFollowers', modifier: 1 },
					session,
				);
				return result;
			});
		} catch (error) {
			if ((error as { code?: number })?.code === 11000) throw new ConflictException('Already following this member');
			throw error;
		}
	}

	public async unsubscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		return await this.connection.transaction(async (session) => {
			// Allow leaving a blocked or soft-deleted member's followers as well.
			const result = await this.followModel.findOneAndDelete({ followingId, followerId }).session(session).exec();
			if (!result) throw new NotFoundException(Message.NO_DATA_FOUND);
			await this.memberService.memberStatsEditor(
				{ _id: followerId, targetKey: 'memberFollowings', modifier: -1 },
				session,
			);
			await this.memberService.memberStatsEditor(
				{ _id: followingId, targetKey: 'memberFollowers', modifier: -1 },
				session,
			);
			return result;
		});
	}

	public async getMemberFollowings(memberId: ObjectId, input: FollowInquiry): Promise<Followings> {
		const { page, limit, search } = input;
		if (!search?.followerId) throw new BadRequestException(Message.BAD_REQUEST);
		const match: T = { followerId: search?.followerId };

		const result = await this.followModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: Direction.DESC, _id: Direction.DESC } },
				lookupFollowingData,
				{ $unwind: '$followingData' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupAuthMemberLiked(memberId, '$followingId'),
							lookupAuthMemberFollowed({
								followerId: memberId,
								followingId: '$followingId',
							}),
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		return result[0] ?? { list: [], metaCounter: [] };
	}

	public async getMemberFollowers(memberId: ObjectId, input: FollowInquiry): Promise<Followers> {
		const { page, limit, search } = input;
		if (!search?.followingId) throw new BadRequestException(Message.BAD_REQUEST);

		const match: T = { followingId: search?.followingId };

		const result = await this.followModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: Direction.DESC, _id: Direction.DESC } },
				lookupFollowerData,
				{ $unwind: '$followerData' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupAuthMemberLiked(memberId, '$followerId'),
							lookupAuthMemberFollowed({
								followerId: memberId,
								followingId: '$followerId',
							}),
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		return result[0] ?? { list: [], metaCounter: [] };
	}
}
