import { Injectable } from '@nestjs/common';
import { Language } from '@prisma/client';

import { DatabaseService } from './../database/database.service';
import { LanguageNotFound } from './languages.exceptions';

@Injectable()
export class LanguagesService {
  constructor(private databaseService: DatabaseService) {}

  async getLanguages(): Promise<Language[]> {
    return this.databaseService.language.findMany();
  }

  async getLanguage(id: string): Promise<Language> {
    const language = await this.databaseService.language.findFirst({
      where: { id },
    });

    if (!language) {
      throw new LanguageNotFound();
    }

    return language;
  }
}
