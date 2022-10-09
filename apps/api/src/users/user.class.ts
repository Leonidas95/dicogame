import { User as UserPrisma } from '@prisma/client';

export class User implements UserPrisma {
  id: string;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}
