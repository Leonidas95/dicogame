import { Test, TestingModule } from '@nestjs/testing';

import { DatabaseService } from './../database/database.service';
import { User } from './user.class';
import { UserNotFound } from './users.exceptions';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let databaseService: DatabaseService;

  const oneUser = Object.assign<User, Partial<User>>(new User(), { id: 'user-id' });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useFactory: jest.fn(() => ({
            user: {
              findUnique: jest.fn().mockResolvedValue(oneUser),
            },
          })),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  describe('findUserFromId', () => {
    it('successfully returns one user', async () => {
      const res = await service.findUserFromId('user-id');

      expect(res).toEqual(oneUser);
      expect(databaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
    });

    it('fails to find a user and throws UserNotFound', async () => {
      jest.spyOn(databaseService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findUserFromId('unknown-user-id')).rejects.toThrowError(UserNotFound);
      expect(databaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'unknown-user-id' },
      });
    });
  });

  describe('findUserFromEmail', () => {
    it('successfully returns one user', async () => {
      const res = await service.findUserFromEmail('user-email');

      expect(res).toEqual(oneUser);
      expect(databaseService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user-email' },
      });
    });

    it('fails to find a user and throws UserNotFound', async () => {
      jest.spyOn(databaseService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findUserFromEmail('unknown-user-email')).rejects.toThrowError(UserNotFound);
      expect(databaseService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'unknown-user-email' },
      });
    });
  });
});
