import { UnauthorizedException } from '@nestjs/common';

export class AuthBadCredentials extends UnauthorizedException {
  getResponse() {
    return 'AUTH_BAD_CREDENTIALS';
  }
}

export class AuthBadUserFromPayload extends UnauthorizedException {
  getResponse() {
    return 'AUTH_BAD_USER_FROM_PAYLOAD';
  }
}
