import { Test, TestingModule } from '@nestjs/testing';

import { LobbiesController } from './lobbies.controller';
import { LobbiesService } from './lobbies.service';
import { Lobby } from './lobby.class';

describe('LobbiesController', () => {
  let controller: LobbiesController;
  let service: LobbiesService;

  let lobby: Lobby;
  let lobbies: Lobby[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LobbiesController],
      providers: [
        {
          provide: LobbiesService,
          useFactory: jest.fn(() => ({ getLobbies: jest.fn(() => []) })),
        },
      ],
    }).compile();

    controller = module.get<LobbiesController>(LobbiesController);
    service = module.get<LobbiesService>(LobbiesService);

    lobby = new Lobby('lobby-name', 3, false);
    lobbies = [lobby];
  });

  describe('getLobbies', () => {
    it('returns an empty array', async () => {
      const lobbies = controller.getLobbies();

      expect(service.getLobbies).toHaveBeenCalled();
      expect(lobbies).toEqual([]);
    });

    it('returns an array with one Lobby', async () => {
      jest.spyOn(service, 'getLobbies').mockReturnValue(lobbies);

      const lobbiessArray = controller.getLobbies();

      expect(service.getLobbies).toHaveBeenCalled();
      expect(lobbiessArray).toEqual(lobbies);
    });
  });
});
