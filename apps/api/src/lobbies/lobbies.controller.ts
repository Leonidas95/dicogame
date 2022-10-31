import { Controller, Get } from '@nestjs/common';

import { LobbiesService } from './lobbies.service';
import { Lobby } from './lobby.class';

@Controller('lobbies')
export class LobbiesController {
  constructor(private readonly service: LobbiesService) {}

  @Get()
  getLobbies(): Lobby[] {
    return this.service.getLobbies();
  }
}
