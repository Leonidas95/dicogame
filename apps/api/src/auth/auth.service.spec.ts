import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcrypt';

import { getLoggerProvider } from './../../test/helper';
import { User } from './../users/user.class';
import { UsersService } from './../users/users.service';
import { AuthBadCredentials, AuthBadUserFromPayload } from './auth.exceptions';
import { AuthService } from './auth.service';
import { AuthLogInDto } from './dto/auth-login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const oneUser = Object.assign<User, Partial<User>>(new User(), {
    id: 'user-id',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        getLoggerProvider(),
        {
          provide: UsersService,
          useFactory: jest.fn(() => ({
            findUserFromEmail: jest.fn().mockResolvedValue(oneUser),
            findUserFromId: jest.fn().mockResolvedValue(oneUser),
          })),
        },
        {
          provide: JwtService,
          useFactory: jest.fn(() => ({ sign: jest.fn(() => 'jwt-string') })),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    let dto: AuthLogInDto;

    beforeEach(() => {
      dto = { email: 'email', password: 'password' };
      bcrypt.compare = jest.fn().mockResolvedValue(true);
    });

    it('successfully logs in user', async () => {
      const res = await service.login(dto);

      expect(usersService.findUserFromEmail).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalled();
      expect(res).toEqual({ token: 'jwt-string' });
    });

    it('finds user but password is incorrect and throws AuthBadCredentials', async () => {
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrowError(AuthBadCredentials);
      expect(usersService.findUserFromEmail).toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('does not find user and throws AuthBadCredentials', async () => {
      jest.spyOn(usersService, 'findUserFromEmail').mockRejectedValue(new Error());

      await expect(service.login(dto)).rejects.toThrowError(AuthBadCredentials);
      expect(usersService.findUserFromEmail).toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('validate', () => {
    it('returns user', async () => {
      const res = await service.validate({ userId: 'user-id', isAdmin: false });

      expect(res).toEqual({ userId: 'user-id', isAdmin: false });
      expect(usersService.findUserFromId).toHaveBeenCalled();
    });

    it('fails to find user and throws AuthBadUserFromPayload', async () => {
      jest.spyOn(usersService, 'findUserFromId').mockRejectedValue(new Error());

      await expect(service.validate({ userId: 'unknown-user-id', isAdmin: false })).rejects.toThrowError(
        AuthBadUserFromPayload,
      );
      expect(usersService.findUserFromId).toHaveBeenCalled();
    });
  });
});
