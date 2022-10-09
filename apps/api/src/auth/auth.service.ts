import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { verify } from 'argon2';

import { UsersService } from './../users/users.service';
import { AuthBadCredentials, AuthBadUserFromPayload } from './auth.exceptions';
import { AuthLogInDto } from './dto/auth-login.dto';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async login(dto: AuthLogInDto): Promise<{ token: string }> {
    const { email, password } = dto;
    let user: User;

    try {
      user = await this.usersService.findUserFromEmail(email);
    } catch (error) {
      // ignore thrown exception
    }

    if (!!user && (await this.verifyPassword(user.password, password))) {
      this.logger.log(`User '${user.id}' successfully logged in`);
      return this.generateToken(user);
    }

    this.logger.warn(`Failed log in with email '${email}'`);
    throw new AuthBadCredentials();
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    try {
      await this.usersService.findUserFromId(payload.userId);
      return payload;
    } catch (error) {
      throw new AuthBadUserFromPayload();
    }
  }

  private async verifyPassword(passwordHash: string, password: string) {
    return verify(passwordHash, password);
  }

  private generateToken(user: Pick<User, 'id' | 'isAdmin'>): { token: string } {
    const payload: JwtPayload = { userId: user.id, isAdmin: user.isAdmin };

    return { token: this.jwtService.sign(payload) };
  }
}
