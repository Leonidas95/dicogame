import { NotFoundException } from '@nestjs/common';

export class LanguageNotFound extends NotFoundException {
  getResponse() {
    return 'LANGUAGE_NOT_FOUND';
  }
}
