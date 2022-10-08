import { Test, TestingModule } from '@nestjs/testing';
import { Language } from '@prisma/client';

import { LanguagesController } from './languages.controller';
import { LanguagesService } from './languages.service';

describe('LanguagesController', () => {
  let controller: LanguagesController;
  let service: LanguagesService;

  let languages: Language[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanguagesController],
      providers: [
        {
          provide: LanguagesService,
          useFactory: jest.fn(() => ({ getLanguages: jest.fn(() => []) })),
        },
      ],
    }).compile();

    controller = module.get<LanguagesController>(LanguagesController);
    service = module.get<LanguagesService>(LanguagesService);

    languages = [
      Object.assign<Language, Partial<Language>>({ id: 'language-id', iso: 'iso', name: 'language-name' }, {}),
    ];
  });

  it('returns an empty array', async () => {
    const languages = await controller.getLanguages();

    expect(service.getLanguages).toHaveBeenCalled();
    expect(languages).toEqual([]);
  });

  it('returns an array with one language', async () => {
    jest.spyOn(service, 'getLanguages').mockResolvedValue(languages);

    const languagesArray = await controller.getLanguages();

    expect(service.getLanguages).toHaveBeenCalled();
    expect(languagesArray).toEqual(languages);
  });
});
