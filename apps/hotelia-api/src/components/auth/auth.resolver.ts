import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Member } from '../../libs/dto/member/member';
import { TokenPair } from '../../libs/dto/auth/token-pair';
import { AuthService } from './auth.service';
import { AuthMember } from './decorators/authMember.decorator';
import { AuthGuard } from './guards/auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => TokenPair)
  public refreshToken(@Args('token') token: string): Promise<TokenPair> {
    return this.authService.refreshTokens(token);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public logout(@AuthMember() member: Member): Promise<boolean> {
    return this.authService.logout(member);
  }
}
