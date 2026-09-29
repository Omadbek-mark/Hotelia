import { Field, Int, ObjectType } from "@nestjs/graphql";
import * as mongoose from "mongoose";
import { MemberAuthType, MemberStatus, MemberType } from "../../enums/member.enum";
import { ViewGroup } from "../../enums/view.enum";

@ObjectType()
export class View {
  @Field(() => String)
  _id!: mongoose.ObjectId;

  @Field(() => ViewGroup)
  viewGroup!: ViewGroup;

  @Field(() => String)
  viewRefId!: mongoose.ObjectId;

  @Field(() => String)
  memberId!: mongoose.ObjectId;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
