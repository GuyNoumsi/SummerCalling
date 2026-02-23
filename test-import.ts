import { prisma } from './lib/prisma';
import './lib/weather';

console.log("Imports successful");

async function main() {
  console.log("Prisma client:", prisma);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
