import { Word as WordPrisma } from '@prisma/client';

export class Word implements WordPrisma {
  id: string;
  name: string;
  languageId: string;
  createdAt: Date;
  updatedAt: Date;
}
