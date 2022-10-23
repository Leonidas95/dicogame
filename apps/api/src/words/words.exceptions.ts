import { NotFoundException } from '@nestjs/common';

export class WordNotFound extends NotFoundException {
  getResponse() {
    return 'WORD_NOT_FOUND';
  }
}
