import { Test, TestingModule } from '@nestjs/testing';

import { LobbiesGateway } from './lobbies.gateway';
import { LobbiesService } from './lobbies.service';

describe('LobbiesGateway', () => {
  let gateway: LobbiesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LobbiesGateway,
        {
          provide: LobbiesService,
          useFactory: jest.fn(() => ({})),
        },
      ],
    }).compile();

    gateway = module.get<LobbiesGateway>(LobbiesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
