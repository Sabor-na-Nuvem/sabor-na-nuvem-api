import { createAuthModule } from '@joaoschmitz/express-prisma-auth';
import { RoleUsuario } from '@prisma/client';
import prisma from './prisma.js';

// TODO: implementar um serviço de email real
const emailService = {
  sendVerificationEmail: async (to, token) => {
    const url = `http://localhost:${process.env.PORT}/api/auth/verify-email?token=${token}`;
    console.log(`[MOCK EMAIL] Para: ${to} | Verifique em: ${url}`);
  },
  sendPasswordResetEmail: async (to, token) => {
    const url = `http://localhost:3001/reset-password?token=${token}`; // URL do Frontend
    console.log(`[MOCK EMAIL] Para: ${to} | Redefina em: ${url}`);
  },
  sendUpdateEmailConfirmation: async (to, token) => {
    const url = `http://localhost:${process.env.PORT}/api/auth/verify-email-update?token=${token}`;
    console.log(`[MOCK EMAIL] Para: ${to} | Confirme o novo email em: ${url}`);
  },
};

// URLs para onde o usuário será redirecionado pelo pacote
const authRedirectUrls = {
  emailVerifySuccess: 'http://localhost:3001/login?message=email-verificado',
  emailVerifyError: 'http://localhost:3001/login?error=verificacao-falhou',
  passwordResetSuccess: 'http://localhost:3001/login?message=senha-redefinida',
  passwordResetError:
    'http://localhost:3001/reset-password?error=token-invalido',
  emailUpdateSuccess: 'http://localhost:3001/perfil?message=email-atualizado',
  emailUpdateError:
    'http://localhost:3001/perfil?error=email-atualizacao-falhou',
};

const hookCriarRelatorio = async (tx, novoUsuario) => {
  await tx.relatorioUsuario.create({ data: { usuarioId: novoUsuario.id } });
};

const authModule = createAuthModule({
  prismaClient: prisma,
  jwtSecret: process.env.JWT_SECRET,
  defaultUserRole: RoleUsuario.CLIENTE,
  emailService,
  urls: authRedirectUrls,
  onUserRegistered: hookCriarRelatorio,
});

// Exporte o módulo e o enum para uso em toda a aplicação
export const { authRoutes, authMiddleware } = authModule;
export { RoleUsuario };
