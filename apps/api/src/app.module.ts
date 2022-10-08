import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { LanguagesModule } from './languages/languages.module';

@Module({
  imports: [DatabaseModule, LanguagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
