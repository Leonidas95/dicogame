import { Test, TestingModule } from '@nestjs/testing';

import { DatabaseService } from './../database/database.service';
import { Word } from './word.class';
import { WordNotFound } from './words.exceptions';
import { WordsService } from './words.service';

describe('WordsService', () => {
  let service: WordsService;
  let databaseService: DatabaseService;

  const oneWord = Object.assign<Word, Partial<Word>>(new Word(), { id: 'word-id', name: 'word-name' });

  const wordArray = [oneWord];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordsService,
        {
          provide: DatabaseService,
          useFactory: jest.fn(() => ({
            word: {
              findMany: jest.fn().mockResolvedValue(wordArray),
              findFirst: jest.fn().mockResolvedValue(oneWord),
            },
          })),
        },
      ],
    }).compile();

    service = module.get<WordsService>(WordsService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  describe('getWords', () => {
    it('returns an empty array', async () => {
      jest.spyOn(databaseService.word, 'findMany').mockResolvedValue([]);

      const words = await service.getWords();

      expect(databaseService.word.findMany).toHaveBeenCalledWith({
        include: { language: true, wordDefinitions: true },
      });
      expect(words).toEqual([]);
    });

    it('returns an array with one word', async () => {
      const words = await service.getWords();

      expect(databaseService.word.findMany).toHaveBeenCalledWith({
        include: { language: true, wordDefinitions: true },
      });
      expect(words).toEqual(wordArray);
    });
  });

  describe('getWord', () => {
    it('returns one word', async () => {
      const word = await service.getWord('word-id');

      expect(databaseService.word.findFirst).toHaveBeenCalledWith({
        where: { id: 'word-id' },
        include: { language: true, wordDefinitions: true },
      });
      expect(word).toEqual(oneWord);
    });

    it('throws a WordNotFound exception', async () => {
      jest.spyOn(databaseService.word, 'findFirst').mockResolvedValue(null);

      await expect(service.getWord('unknown-word-id')).rejects.toThrowError(WordNotFound);
      expect(databaseService.word.findFirst).toHaveBeenCalledWith({
        where: { id: 'unknown-word-id' },
        include: { language: true, wordDefinitions: true },
      });
    });
  });
});
