import { MemberPublic } from '../../libs/dto/member/member-public';
import { escapeSearchText } from '../../libs/search';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, ObjectId, Types } from 'mongoose';
import { Member, Members } from '../../libs/dto/member/member';
import { HotelOwnersInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { MemberAuthType, MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { AdminMemberUpdate, MemberUpdate } from '../../libs/dto/member/member.update';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeService } from '../like/like.service';
import { Follower, Following, MeFollowed } from '../../libs/dto/follow/follow';
import { lookupAuthMemberLiked } from '../../libs/config';

@Injectable()
export class MemberService {
  constructor(
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    @InjectModel('Follow') private readonly followModel: Model<Follower | Following>,
    private authService: AuthService,
    private viewService: ViewService,
    private likeService: LikeService,
  ) { }

  public async signup(input: MemberInput): Promise<Member> {
    const memberType = input.memberType ?? MemberType.USER;
    if (![MemberType.USER, MemberType.HOTEL_OWNER].includes(memberType)) {
      throw new ForbiddenException(Message.NOT_ALLOWED_REQUEST);
    }
    const memberPassword = await this.authService.hashPassword(input.memberPassword);
    let result: Member;
    try {
      result = await this.memberModel.create({
        memberNick: input.memberNick,
        memberEmail: input.memberEmail.trim().toLowerCase(),
        memberPhone: input.memberPhone?.trim() || undefined,
        memberPassword,
        memberType,
        memberStatus: MemberStatus.ACTIVE,
        memberAuthType: MemberAuthType.EMAIL,
      });
    } catch (err) {
      this.rethrowMemberWriteError(err);
    }
    Object.assign(result!, await this.authService.createSession(result!));
    return result!;
  }

  private rethrowMemberWriteError(error: unknown): never {
    if ((error as { code?: number })?.code === 11000) {
      throw new ConflictException(Message.USED_MEMBER_NICK_EMAIL_OR_PHONE);
    }
    throw error;
  }

  // Explicit allowlist also protects direct service calls from role/statistic changes.
  private async profileChanges(input: MemberUpdate): Promise<Record<string, unknown>> {
    const changes: Record<string, unknown> = {};
    for (const key of ['memberNick', 'memberFullName', 'memberImage', 'memberAddress', 'memberDesc'] as const) {
      if (input[key] != null) changes[key] = input[key];
    }
    if (input.memberPhone != null) {
      const phone = input.memberPhone.trim();
      if (!phone) throw new BadRequestException(Message.BAD_REQUEST);
      changes.memberPhone = phone;
    }
    if (input.memberEmail != null) changes.memberEmail = input.memberEmail.trim().toLowerCase();
    if (input.memberPassword != null) {
      changes.memberPassword = await this.authService.hashPassword(input.memberPassword);
    }
    return changes;
  }

  public async login(input: LoginInput): Promise<Member> {
    const { memberNick, memberPassword } = input;
    const response: Member | null = await this.memberModel
      .findOne({ memberNick: memberNick })
      .select("+memberPassword")
      .exec();
    
    if (!response || response.memberStatus === MemberStatus.DELETE) {
      throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
    } else if (response.memberStatus === MemberStatus.BLOCK) {
      throw new ForbiddenException(Message.BLOCKED_USER);
    } 

    const isMatch = await this.authService.comparePasswords(input.memberPassword, response.memberPassword);
    if (!isMatch) throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
    Object.assign(response, await this.authService.createSession(response));
    
    return response;
  }

  public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
    const changes = await this.profileChanges(input);
    let result: Member | null;
    try {
      result = await this.memberModel.findOneAndUpdate(
        { _id: memberId, memberStatus: MemberStatus.ACTIVE },
        { $set: changes },
        { new: true, runValidators: true },
      ).exec();
    } catch (err) {
      this.rethrowMemberWriteError(err);
    }

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    return result;
  }

  public async getHotelOwner(ownerId: Types.ObjectId): Promise<MemberPublic | null> {
    const owner = await this.memberModel.findOne({
      _id: ownerId,
      memberStatus: MemberStatus.ACTIVE,
      memberType: MemberType.HOTEL_OWNER,
    }).select('_id memberNick memberImage memberDesc').lean().exec();

    if (!owner) return null;
    return {
      _id: new Types.ObjectId(owner._id.toString()),
      memberNick: owner.memberNick,
      memberImage: owner.memberImage,
      memberDesc: owner.memberDesc,
    };
  }

  public async getMember(memberId: ObjectId, targetId: ObjectId): Promise<Member> {
    const search: T = {
      _id: targetId,
      memberStatus: {
        $in: [MemberStatus.ACTIVE, MemberStatus.BLOCK],
      },
    };
    const targetMember = await this.memberModel.findOne(search).lean().exec();
    if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    if (memberId) {
      const viewInput = { memberId: memberId, viewRefId: targetId, viewGroup: ViewGroup.MEMBER };
      const newView = await this.viewService.recordView(viewInput);

      if (newView) {
        await this.memberModel.findOneAndUpdate(search, { $inc: { memberViews: 1 } }, { new: true }).exec();
        targetMember.memberViews++;
      }

      // meLiked
      const likeInput = { memberId: memberId, likeRefId: targetId, likeGroup: LikeGroup.MEMBER };
      targetMember.meLiked = (await this.likeService.checkLikeExistence(likeInput)) as unknown as typeof targetMember.meLiked;

      targetMember.meFollowed = (await this.checkSubscription(memberId, targetId)) as unknown as typeof targetMember.meFollowed;
    }
    
    return targetMember;
  }

  private async checkSubscription(followerId: ObjectId, followingId: ObjectId): Promise<MeFollowed[]> {
    const result = await this.followModel.findOne({ followingId: followingId, followerId: followerId }).exec();
    return result ? [{ followerId: followerId, followingId: followingId, myFollowing: true }] : [];
  }

  public async getHotelOwners(memberId: ObjectId, input: HotelOwnersInquiry): Promise<Members> {
		const { text } = input.search;
		const match: T = { memberType: MemberType.HOTEL_OWNER, memberStatus: MemberStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

        if (text) match.memberNick = { $regex: escapeSearchText(text), $options: 'i' };
		console.log('match:', match);

		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupAuthMemberLiked(memberId),
            ],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
  }
  
  public async likeTargetMember(memberId: ObjectId, likeRefId: ObjectId): Promise<Member> {
    const target: Member | null = await this.memberModel.findOne({ _id: likeRefId, memberStatus: MemberStatus.ACTIVE }).exec();
    if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const input: LikeInput = {
      memberId: memberId,
      likeRefId: likeRefId,
      likeGroup: LikeGroup.MEMBER,
    };

    // LIKE TOGGLE via Like modules
    const modifier: number = await this.likeService.toggleLike(input);
    const result = await this.memberStatsEditor({ _id: likeRefId, targetKey: 'memberLikes', modifier: modifier });

    if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
    return result;
  }

  public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members> {
		const { memberStatus, memberType, text } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (memberStatus) match.memberStatus = memberStatus;
		if (memberType) match.memberType = memberType;
        if (text) match.memberNick = { $regex: escapeSearchText(text), $options: 'i' };

		console.log('match:', match);

		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		return result[0];
	}

  public async updateMemberByAdmin(input: AdminMemberUpdate): Promise<Member> {
    const changes = await this.profileChanges(input);
    if (input.memberType != null) changes.memberType = input.memberType;
    if (input.memberStatus != null) changes.memberStatus = input.memberStatus;
    let result: Member | null;
    try {
      result = await this.memberModel.findOneAndUpdate(
        { _id: input._id }, { $set: changes }, { new: true, runValidators: true },
      ).exec();
    } catch (err) {
      this.rethrowMemberWriteError(err);
    }
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
    return result;
  }
  
  public async memberStatsEditor(input: StatisticModifier, session?: ClientSession): Promise<Member>{
    const { _id, targetKey, modifier } = input;
    const result = await this.memberModel
      .findOneAndUpdate(
        { _id, ...(targetKey === 'memberHotels' ? { memberStatus: MemberStatus.ACTIVE, memberType: MemberType.HOTEL_OWNER } : {}) },
        { $inc: { [targetKey]: modifier } },
        { new: true, session },
      )
      .exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    return result;
  }
}
