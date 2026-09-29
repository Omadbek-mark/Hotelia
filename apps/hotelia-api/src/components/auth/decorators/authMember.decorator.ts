import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Member } from '../../../libs/dto/member/member';
import { getAuthRequest } from '../guards/request-auth';

export const AuthMember = createParamDecorator((data: keyof Member | undefined, context: ExecutionContext) => {
  const member = getAuthRequest(context).authMember;
  return member ? (data ? member[data] : member) : null;
});
