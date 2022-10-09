import { NotFoundException } from '@nestjs/common';

export class UserNotFound extends NotFoundException {
  getResponse() {
    return 'USER_NOT_FOUND';
  }
}
