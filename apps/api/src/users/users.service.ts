import { Injectable } from '@nestjs/common';

import { DatabaseService } from './../database/database.service';
import { User } from './user.class';
import { UserNotFound } from './users.exceptions';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findUserFromId(id: string): Promise<User> {
    const user = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new UserNotFound();
    }

    return user;
  }

  async findUserFromEmail(email: string): Promise<User> {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UserNotFound();
    }

    return user;
  }
}
