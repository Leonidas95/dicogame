import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Word } from '@prisma/client';

import { AdminGuard } from './../auth/guards/admin.guard';
import { WordsService } from './words.service';

@Controller('words')
@UseGuards(AuthGuard(), AdminGuard)
export class WordsController {
  constructor(private readonly service: WordsService) {}

  @Get()
  getWords(): Promise<Word[]> {
    return this.service.getWords();
  }

  @Get(':id')
  getWord(@Param('id') id: string): Promise<Word> {
    return this.service.getWord(id);
  }
}
