import { Test, TestingModule } from '@nestjs/testing';

import { DatabaseService } from './../database/database.service';
import { LanguagesService } from './languages.service';

describe('LanguagesService', () => {
  let service: LanguagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguagesService,
        {
          provide: DatabaseService,
          useFactory: jest.fn(() => ({
            language: jest.fn(() => ({
              findMany: jest.fn(),
            })),
          })),
        },
      ],
    }).compile();

    service = module.get<LanguagesService>(LanguagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
