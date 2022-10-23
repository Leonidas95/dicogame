import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

import { JwtPayload } from '../jwt-payload.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userPayload = request.user as JwtPayload;

    if (!!userPayload && userPayload.isAdmin) {
      return true;
    }
    throw new ForbiddenException();
  }
}
