import { Test, TestingModule } from '@nestjs/testing';

import { getLoggerProvider } from './../../test/helper';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthLogInDto } from './dto/auth-login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        getLoggerProvider(),
        {
          provide: AuthService,
          useFactory: jest.fn(() => ({ login: jest.fn() })),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('calls login service', async () => {
      jest.spyOn(service, 'login').mockResolvedValue({ token: 'token' });

      const dto: AuthLogInDto = { email: 'email', password: 'password' };
      const res = await controller.login(dto);

      expect(res).toEqual({ token: 'token' });
      expect(service.login).toHaveBeenCalledWith(dto);
    });
  });
});
