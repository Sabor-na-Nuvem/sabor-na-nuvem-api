/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Cria um cliente Prisma que USA as variáveis de .env.test
const prismaTestClient = new PrismaClient();

// Função para rodar a migração no banco de teste
const setupTestDatabase = () => {
  try {
    console.log('Aplicando migrações no banco de dados de teste...');
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'inherit',
    });
    console.log('Migrações aplicadas com sucesso.');
  } catch (error) {
    console.error('Falha ao aplicar migrações:', error);
    process.exit(1);
  }
};

// Função para limpar TODAS as tabelas
const cleanupTestDatabase = async () => {
  const tableNames = await prismaTestClient.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;

  // Desativa constraints, trunca, reativa constraints
  await prismaTestClient.$executeRawUnsafe('SET CONSTRAINTS ALL DEFERRED;');
  for (const { tablename } of tableNames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prismaTestClient.$executeRawUnsafe(
          `TRUNCATE TABLE "public"."${tablename}" RESTART IDENTITY CASCADE;`,
        );
      } catch (error) {
        console.error(`Erro ao truncar tabela ${tablename}:`, error);
      }
    }
  }
  await prismaTestClient.$executeRawUnsafe('SET CONSTRAINTS ALL IMMEDIATE;');
};

export { prismaTestClient, setupTestDatabase, cleanupTestDatabase };
