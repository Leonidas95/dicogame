import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Word } from '@prisma/client';

import { AdminGuard } from './../auth/guards/admin.guard';
import { CreateWordDto } from './dto/create-word.dto';
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

  @Post()
  createWord(@Body() dto: CreateWordDto): Promise<Word> {
    return this.service.createWord(dto);
  }
}
