import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
  await prisma.user.upsert({
    create: {
      username: 'admin',
      email: 'admin@dicogame.github.io',
      isAdmin: true,
      password: '$argon2id$v=19$m=4096,t=3,p=1$bmx1WXFMTDBsOWRnYXlrVQ$/9koyutLVoW4c8pJE6U7Og', // DicoGameAdmin
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
