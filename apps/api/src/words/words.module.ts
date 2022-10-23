import { Module } from '@nestjs/common';
import { WordsController } from './words.controller';
import { WordsService } from './words.service';
import { DefinitionsModule } from './definitions/definitions.module';

@Module({
  controllers: [WordsController],
  providers: [WordsService],
  imports: [DefinitionsModule],
})
export class WordsModule {}
