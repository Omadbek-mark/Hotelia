import { Type } from 'class-transformer';
import { Field, InputType, Int } from "@nestjs/graphql";
import { IsEmail, IsEnum, IsInt, Max, IsObject, ValidateNested, IsIn, IsNotEmpty, IsOptional, Length, Min } from "class-validator";
import { MemberStatus, MemberType } from "../../enums/member.enum";
import { availableHotelOwnerSorts, availableMemberSorts } from "../../config";
import { Direction } from "../../enums/common.enum";


@InputType() 
export class MemberInput {
  @IsNotEmpty()
  @Length(3, 12)
  @Field(() => String)
  memberNick!: string;

  @IsNotEmpty()
  @Length(5, 12)
  @Field(() => String)
  memberPassword!: string;

  @IsEmail()
  @Field(() => String)
  memberEmail!: string;

  @IsOptional()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  memberPhone?: string;

  @IsOptional()
  @IsIn([MemberType.USER, MemberType.HOTEL_OWNER])
  @Field(() => MemberType, { nullable: true })
  memberType?: MemberType;

}

@InputType()
export class LoginInput {
  @IsNotEmpty()
  @Length(3, 12)
  @Field(() => String)
  memberNick!: string;

  @IsNotEmpty()
  @Length(5, 12)
  @Field(() => String)
  memberPassword!: string;
}

@InputType()
class OwnerSearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class HotelOwnersInquiry {
	@IsNotEmpty()
	@Min(1)
	@Max(1000000)
	@IsInt()
	@Field(() => Int)
	page!: number;

	@IsNotEmpty()
	@Min(1)
	@Max(100)
	@IsInt()
	@Field(() => Int)
	limit!: number;

	@IsOptional()
	@IsIn(availableHotelOwnerSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@IsEnum(Direction)
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@IsObject()
	@ValidateNested()
	@Type(() => OwnerSearch)
	@Field(() => OwnerSearch)
	search!: OwnerSearch;
}

@InputType()
class MISearch {
	@IsOptional()
	@IsEnum(MemberStatus)
	@Field(() => MemberStatus, { nullable: true })
	memberStatus?: MemberStatus;

	@IsOptional()
	@IsEnum(MemberType)
	@Field(() => MemberType, { nullable: true })
	memberType?: MemberType;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class MembersInquiry {
	@IsNotEmpty()
	@Min(1)
	@Max(1000000)
	@IsInt()
	@Field(() => Int)
	page!: number;

	@IsNotEmpty()
	@Min(1)
	@Max(100)
	@IsInt()
	@Field(() => Int)
	limit!: number;

	@IsOptional()
	@IsIn(availableMemberSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@IsEnum(Direction)
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@IsObject()
	@ValidateNested()
	@Type(() => MISearch)
	@Field(() => MISearch)
	search!: MISearch;
}
