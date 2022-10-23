import { PrismaClient, Word, WordDefinition } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const main = async () => {
  await prisma.user.upsert({
    create: {
      username: 'admin',
      email: 'admin@dicogame.github.io',
      isAdmin: true,
      password: '$2b$10$IKi3W8fVfHWUWQH3If/7.uMLuhlfsh60UvBNEq2mZR76YkLN6miCC', // DicoGameAdmin
    },
    where: { username: 'admin' },
    update: {},
  });

  await addWords();
};

const addWords = async () => {
  await prisma.wordDefinition.deleteMany({}); // use with caution.
  await prisma.word.deleteMany({}); // use with caution.

  const languages = await prisma.language.findMany();

  const WORDS_TO_ADD = 10;
  const words: Word[] = [];
  const wordDefinitions: WordDefinition[] = [];

  languages.forEach((language) => {
    faker.locale = language.iso.slice(0, 2);
    for (let i = 0; i < WORDS_TO_ADD; ++i) {
      const wordId = faker.datatype.uuid();
      const date = faker.date.recent();
      words.push({
        id: wordId,
        name: faker.word.noun().toUpperCase(),
        languageId: language.id,
        createdAt: date,
        updatedAt: date,
      });

      const numberOfDefinitions = randomNumber(1, 3);
      for (let j = 0; j < numberOfDefinitions; j++) {
        wordDefinitions.push({
          id: faker.datatype.uuid(),
          definition: faker.lorem.sentence(),
          wordId,
          createdAt: date,
          updatedAt: date,
        });
      }
    }
  });

  await prisma.word.createMany({ data: words });
  await prisma.wordDefinition.createMany({ data: wordDefinitions });
};

const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
