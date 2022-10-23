import { Injectable } from '@nestjs/common';
import { Word } from '@prisma/client';

import { DatabaseService } from './../database/database.service';
import { WordNotFound } from './words.exceptions';

@Injectable()
export class WordsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getWords(): Promise<Word[]> {
    return this.databaseService.word.findMany({ include: { language: true, wordDefinitions: true } });
  }

  async getWord(id: string): Promise<Word> {
    const word = await this.databaseService.word.findFirst({
      where: { id },
      include: { language: true, wordDefinitions: true },
    });

    if (!word) {
      throw new WordNotFound();
    }

    return word;
  }
}
