import { Module } from '@nestjs/common';

import { DatabaseModule } from './../../database/database.module';
import { DefinitionsService } from './definitions.service';

@Module({
  imports: [DatabaseModule],
  providers: [DefinitionsService],
  exports: [DefinitionsService],
})
export class DefinitionsModule {}
