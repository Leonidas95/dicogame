import { Injectable } from '@nestjs/common';

import { DatabaseService } from './../../database/database.service';

@Injectable()
export class DefinitionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createDefinitions(definitions: string[], wordId: string) {
    return this.databaseService.wordDefinition.createMany({
      data: definitions.map((definition) => ({
        definition: this.formatWordDefinition(definition),
        wordId,
      })),
    });
  }

  private formatWordDefinition(definition: string): string {
    let formattedDefinition = definition.trim();
    formattedDefinition = formattedDefinition.charAt(0).toUpperCase() + formattedDefinition.slice(1);

    if (formattedDefinition.charAt(formattedDefinition.length - 1) !== '.') {
      formattedDefinition += '.';
    }
    return formattedDefinition;
  }
}
