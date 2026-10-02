import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";
import * as mongoose from "mongoose";
import { ViewGroup } from "../../enums/view.enum";



@InputType()
export class ViewInput {
  @IsNotEmpty()
  @Field(() => String)
  memberId!: mongoose.ObjectId | mongoose.Types.ObjectId;

  @IsNotEmpty()
  @Field(() => String)
  viewRefId!: mongoose.ObjectId | mongoose.Types.ObjectId;

  @IsNotEmpty()
  @Field(() => ViewGroup)
  viewGroup!: ViewGroup;
}