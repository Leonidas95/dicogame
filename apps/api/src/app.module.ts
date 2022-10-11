import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { LanguagesModule } from './languages/languages.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().allow('').required(),
        DATABASE_HOSTNAME: Joi.string().required(),
        DATABASE_PORT: Joi.number().port().required(),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        JWT_EXPIRES_IN: [Joi.number().equal(0), Joi.number().greater(59)],
        JWT_SECRET: Joi.string().min(20).required(),
      }),
    }),
    DatabaseModule,
    LanguagesModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
