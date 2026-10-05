import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { HotelOwnersInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { Member, Members } from '../../libs/dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminMemberUpdate, MemberUpdate } from '../../libs/dto/member/member.update';
import { getSerialForImage, shapeIntoMongoObjectId, validMimeTypes } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { saveImage, saveImages } from '../../libs/upload';
import { Message } from '../../libs/enums/common.enum';

@Resolver()
export class MemberResolver {
  constructor(private readonly memberService: MemberService) { }
  
  @Mutation(() => Member)
  public async signup(@Args("input") input: MemberInput): Promise<Member> {
    console.log('Mutation: signup');
    return await this.memberService.signup(input);
  }

  @Mutation(() => Member)
  public async login(@Args("input") input: LoginInput): Promise<Member> {
    console.log('Mutation: login');
    return await this.memberService.login(input);
  }

  @UseGuards(AuthGuard)
  @Query(() => String)
  public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
    console.log('Query: checkAuth');
    console.log('memberNick:', memberNick);
    return `Hi ${memberNick}`;
  }

  @Roles(MemberType.USER, MemberType.HOTEL_OWNER, MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => String)
  public async checkAuthRoles(@AuthMember() authMember: Member): Promise<string> {
    console.log('Query: checkAuthRoles');
    return `Hi ${authMember.memberNick}, you are ${authMember.memberType} (memberId: ${authMember._id})`;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Member)
  public async updateMember(
    @Args('input') input: MemberUpdate,
    @AuthMember('_id') memberId: ObjectId
  ): Promise<Member> {
    console.log('Mutation: updateMember');
    return await this.memberService.updateMember(memberId, input);
  }

  @UseGuards(WithoutGuard)
  @Query(() => Member)
  public async getMember(@Args('memberId') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Member> {
    console.log('Query: getMember');
    const targetId = shapeIntoMongoObjectId(input);
      return await this.memberService.getMember(memberId, targetId);
  }

  @UseGuards(WithoutGuard)
	@Query(() => Members)
	async getHotelOwners(@Args('input') input: HotelOwnersInquiry, @AuthMember('_id') memberId: ObjectId): Promise<Members> {
		console.log('Query: getHotelOwners');
		return await this.memberService.getHotelOwners(memberId, input);
  }
  
  @UseGuards(AuthGuard)
  @Mutation(() => Member)
  public async likeTargetMember(
    @Args('memberId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Member> {
    console.log('Mutation: likeTargetMember');
    const likeRefId = shapeIntoMongoObjectId(input);
    return await this.memberService.likeTargetMember(memberId, likeRefId);
  }
    
  /** ADMIN **/
    
 @Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Members)
	async getAllMembersByAdmin(@Args('input') input: MembersInquiry): Promise<Members> {
		console.log('Query: getAllMembersByAdmin');
		return await this.memberService.getAllMembersByAdmin(input);
	}

	//& Authorization: ADMIN
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Member)
	async updateMemberByAdmin(@Args('input') input: AdminMemberUpdate): Promise<Member> {
		console.log('Mutation: updateMemberByAdmin');
		return await this.memberService.updateMemberByAdmin(input);
  }
  
  /** UPLOADER **/

  @UseGuards(AuthGuard)
  @Mutation((returns) => String)
  public async imageUploader(
    @Args({ name: 'file', type: () => GraphQLUpload })
  file: Promise<FileUpload>,
  @Args('target') target: String,
  ): Promise<string> {
    return await saveImage(await file, String(target));
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => [String])
  public async imagesUploader(
    @Args('files', { type: () => [GraphQLUpload] })
  files: Promise<FileUpload>[],
  @Args('target') target: String,
  ): Promise<string[]> {
    return await saveImages(files, String(target));
  }
}
