import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // Opcional: Esta configuração habilita o log de todas as queries
  // que o Prisma executa. Ótimo para debugging durante o desenvolvimento.
  log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
