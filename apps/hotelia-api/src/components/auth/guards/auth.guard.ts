import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { bearerToken, getAuthRequest } from './request-auth';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = getAuthRequest(context);
    request.authMember = null;
    request.authMember = await this.authService.verifyToken(bearerToken(request));
    return true;
  }
}
