import { Test, TestingModule } from '@nestjs/testing';

import { Word } from './word.class';
import { WordsController } from './words.controller';
import { WordsService } from './words.service';

describe('WordsController', () => {
  let controller: WordsController;
  let service: WordsService;

  let word: Word;
  let words: Word[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WordsController],
      providers: [
        {
          provide: WordsService,
          useFactory: jest.fn(() => ({
            getWords: jest.fn(() => []),
            getWord: jest.fn(() => word),
          })),
        },
      ],
    }).compile();

    controller = module.get<WordsController>(WordsController);
    service = module.get<WordsService>(WordsService);

    word = Object.assign<Word, Partial<Word>>(new Word(), {
      id: 'word-id',
      name: 'word-name',
    });
    words = [word];
  });

  describe('getWords', () => {
    it('returns an empty array', async () => {
      const words = await controller.getWords();

      expect(service.getWords).toHaveBeenCalled();
      expect(words).toEqual([]);
    });

    it('returns an array with one word', async () => {
      jest.spyOn(service, 'getWords').mockResolvedValue(words);

      const wordsArray = await controller.getWords();

      expect(service.getWords).toHaveBeenCalled();
      expect(wordsArray).toEqual(words);
    });
  });

  describe('getWord', () => {
    it('returns one word', async () => {
      const oneWord = await controller.getWord('word-id');

      expect(service.getWord).toHaveBeenCalledWith('word-id');
      expect(oneWord).toEqual(word);
    });
  });
});
