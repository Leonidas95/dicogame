import { Language as LanguagePrisma } from '@prisma/client';

export class Language implements LanguagePrisma {
  id: string;
  iso: string;
  name: string;
}
