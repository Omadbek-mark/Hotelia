import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { bearerToken, getAuthRequest } from './request-auth';

@Injectable()
export class WithoutGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = getAuthRequest(context);
    request.authMember = null;
    if (request.headers?.authorization !== undefined) {
      try {
        request.authMember = await this.authService.verifyToken(bearerToken(request));
      } catch (error) {
        // Public pages allow guests, but infrastructure failures must stay visible.
        if (!(error instanceof UnauthorizedException)) throw error;
      }
    }
    return true;
  }
}
