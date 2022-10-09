import { Injectable } from '@nestjs/common';
import { Language } from '@prisma/client';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class LanguagesService {
  constructor(private databaseService: DatabaseService) {}

  async getLanguages(): Promise<Language[]> {
    return this.databaseService.language.findMany();
  }
}
