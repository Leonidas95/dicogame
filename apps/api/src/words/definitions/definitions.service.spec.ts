import { Test, TestingModule } from '@nestjs/testing';

import { DatabaseService } from './../../database/database.service';
import { DefinitionsService } from './definitions.service';

describe('DefinitionsService', () => {
  let service: DefinitionsService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DefinitionsService,
        {
          provide: DatabaseService,
          useFactory: jest.fn(() => ({
            wordDefinition: {
              createMany: jest.fn().mockResolvedValue({ count: 2 }),
            },
          })),
        },
      ],
    }).compile();

    service = module.get<DefinitionsService>(DefinitionsService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  describe('createDefinitions', () => {
    it('returns an array with one word', async () => {
      const definitions = ['definition1', 'definition2'];

      const createManyBatchPayload = await service.createDefinitions(definitions, 'wordId');

      expect(createManyBatchPayload.count).toEqual(2);
      expect(databaseService.wordDefinition.createMany).toHaveBeenCalledWith({
        data: [
          { definition: 'Definition1.', wordId: 'wordId' },
          { definition: 'Definition2.', wordId: 'wordId' },
        ],
      });
    });
  });
});
