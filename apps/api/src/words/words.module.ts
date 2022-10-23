import { Module } from '@nestjs/common';

import { AuthModule } from './../auth/auth.module';
import { DatabaseModule } from './../database/database.module';
import { LanguagesModule } from './../languages/languages.module';
import { DefinitionsModule } from './definitions/definitions.module';
import { WordsController } from './words.controller';
import { WordsService } from './words.service';

@Module({
  imports: [DatabaseModule, AuthModule, DefinitionsModule, LanguagesModule],
  controllers: [WordsController],
  providers: [WordsService],
  exports: [WordsService],
})
export class WordsModule {}
