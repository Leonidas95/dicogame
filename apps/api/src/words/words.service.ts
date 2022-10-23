import { Injectable } from '@nestjs/common';
import { Word } from '@prisma/client';

import { DatabaseService } from './../database/database.service';
import { LanguagesService } from './../languages/languages.service';
import { DefinitionsService } from './definitions/definitions.service';
import { CreateWordDto } from './dto/create-word.dto';
import { WordNotFound } from './words.exceptions';

@Injectable()
export class WordsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly languagesService: LanguagesService,
    private readonly definitionsService: DefinitionsService,
  ) {}

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

  async createWord(dto: CreateWordDto): Promise<Word> {
    const { name, languageId, definitions } = dto;

    // check if language exists
    await this.languagesService.getLanguage(languageId);

    const word = await this.databaseService.word.create({ data: { name: name.toUpperCase(), languageId } });

    await this.definitionsService.createDefinitions(definitions, word.id);

    // we need to do this in order to get the definitions. Prisma issue https://github.com/prisma/prisma/issues/8131
    return this.getWord(word.id);
  }
}
