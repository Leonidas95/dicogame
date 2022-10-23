import { Test, TestingModule } from '@nestjs/testing';

import { DatabaseService } from './../database/database.service';
import { Language } from './language.class';
import { LanguageNotFound } from './languages.exceptions';
import { LanguagesService } from './languages.service';

describe('LanguagesService', () => {
  let service: LanguagesService;
  let databaseService: DatabaseService;

  const oneLanguage = Object.assign<Language, Partial<Language>>(new Language(), {
    id: 'language-id',
    name: 'language',
  });
  const languageArray = [oneLanguage];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguagesService,
        {
          provide: DatabaseService,
          useFactory: jest.fn(() => ({
            language: {
              findMany: jest.fn().mockResolvedValue(languageArray),
              findFirst: jest.fn().mockResolvedValue(oneLanguage),
            },
          })),
        },
      ],
    }).compile();

    service = module.get<LanguagesService>(LanguagesService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  describe('getLanguagess', () => {
    it('returns an empty array', async () => {
      jest.spyOn(databaseService.language, 'findMany').mockResolvedValue([]);

      const languages = await service.getLanguages();

      expect(databaseService.language.findMany).toHaveBeenCalled();
      expect(languages).toEqual([]);
    });

    it('returns an array with one language', async () => {
      const languages = await service.getLanguages();

      expect(databaseService.language.findMany).toHaveBeenCalled();
      expect(languages).toEqual(languageArray);
    });
  });

  describe('getLanguage', () => {
    it('returns one language', async () => {
      const language = await service.getLanguage('language-id');

      expect(databaseService.language.findFirst).toHaveBeenCalledWith({
        where: { id: 'language-id' },
      });
      expect(language).toEqual(oneLanguage);
    });

    it('throws a LanguageNotFound exception', async () => {
      jest.spyOn(databaseService.language, 'findFirst').mockResolvedValue(null);

      await expect(service.getLanguage('unknown-language-id')).rejects.toThrowError(LanguageNotFound);
      expect(databaseService.language.findFirst).toHaveBeenCalledWith({
        where: { id: 'unknown-language-id' },
      });
    });
  });
});
