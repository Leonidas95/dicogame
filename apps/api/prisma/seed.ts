import { PrismaClient } from '@prisma/client';

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
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
