import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { Message } from '../../../libs/enums/common.enum';
import { MemberType } from '../../../libs/enums/member.enum';
import { bearerToken, getAuthRequest } from './request-auth';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = getAuthRequest(context);
    request.authMember = null;
    const member = await this.authService.verifyToken(bearerToken(request));
    const roles = this.reflector.getAllAndOverride<MemberType[]>('roles', [
      context.getHandler(), context.getClass(),
    ]);
    if (roles?.length && !roles.includes(member.memberType)) {
      throw new ForbiddenException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);
    }
    request.authMember = member;
    return true;
  }
}
