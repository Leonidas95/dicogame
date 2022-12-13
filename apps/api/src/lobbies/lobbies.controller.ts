import { Controller, Get } from '@nestjs/common';

import { LobbiesService } from './lobbies.service';

@Controller('lobbies')
export class LobbiesController {
  constructor(private readonly service: LobbiesService) {}

  @Get()
  getLobbies() {
    return this.service.getLobbies();
  }
}
