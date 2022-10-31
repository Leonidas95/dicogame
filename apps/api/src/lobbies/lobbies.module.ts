import { Module } from '@nestjs/common';

import { LobbiesController } from './lobbies.controller';
import { LobbiesGateway } from './lobbies.gateway';
import { LobbiesService } from './lobbies.service';
import { PlayersModule } from './players/players.module';
import { RoundsModule } from './rounds/rounds.module';

@Module({
  controllers: [LobbiesController],
  providers: [LobbiesService, LobbiesGateway],
  imports: [RoundsModule, PlayersModule],
})
export class LobbiesModule {}
