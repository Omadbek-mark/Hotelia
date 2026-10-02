import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenPair {
  @Field(() => String)
  accessToken!: string;

  @Field(() => String)
  refreshToken!: string;
}
