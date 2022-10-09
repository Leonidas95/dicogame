import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from './../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: jwtSignOptions(configService.get<number>('JWT_EXPIRES_IN')),
      }),
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, Logger],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}

const jwtSignOptions = (expiresIn: number): JwtSignOptions => {
  const signOptions: JwtSignOptions = { algorithm: 'HS512' };

  if (expiresIn > 0) {
    signOptions.expiresIn = expiresIn;
  }

  return signOptions;
};
