import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Member } from '../../../libs/dto/member/member';
import { Message } from '../../../libs/enums/common.enum';

export interface AuthRequest {
  headers: { authorization?: string | string[] };
  authMember?: Member | null;
}

export function getAuthRequest(context: ExecutionContext): AuthRequest {
  if (context.getType<string>() === 'graphql') {
    return GqlExecutionContext.create(context).getContext().req;
  }
  if (context.getType() === 'http') return context.switchToHttp().getRequest();
  throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
}

export function bearerToken(request: AuthRequest): string {
  const header = request.headers?.authorization;
  if (typeof header !== 'string') throw new UnauthorizedException(Message.TOKEN_NOT_EXIST);
  const match = /^Bearer ([^\s]+)$/i.exec(header);
  if (!match) throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
  return match[1];
}
