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

const hookPosRegistro = async (tx, novoUsuario, dadosExtras) => {
  // Cria o relatório (obrigatório)
  await tx.relatorioUsuario.create({
    data: {
      usuarioId: novoUsuario.id,
    },
  });

  // Verifica e cria Endereço (se enviado pelo frontend)
  if (dadosExtras?.endereco) {
    await tx.usuario.update({
      where: { id: novoUsuario.id },
      data: {
        endereco: {
          create: {
            cep: dadosExtras.endereco.cep,
            estado: dadosExtras.endereco.estado,
            cidade: dadosExtras.endereco.cidade,
            bairro: dadosExtras.endereco.bairro,
            logradouro: dadosExtras.endereco.logradouro,
            numero: dadosExtras.endereco.numero,
            complemento: dadosExtras.endereco.complemento || null,
            pontoReferencia: dadosExtras.endereco.pontoReferencia || null,
            latitude: dadosExtras.endereco.latitude
              ? Number(dadosExtras.endereco.latitude)
              : null,
            longitude: dadosExtras.endereco.longitude
              ? Number(dadosExtras.endereco.longitude)
              : null,
          },
        },
      },
    });
  }

  // Verifica e cria Telefones (se enviado pelo frontend)
  if (dadosExtras?.telefones && Array.isArray(dadosExtras.telefones)) {
    await Promise.all(
      dadosExtras.telefones.map((tel) =>
        tx.telefone.create({
          data: {
            ddd: tel.ddd,
            numero: tel.numero,
            usuarioId: novoUsuario.id,
          },
        }),
      ),
    );
  }
};

const authModule = createAuthModule({
  prismaClient: prisma,
  jwtSecret: process.env.JWT_SECRET,
  defaultUserRole: RoleUsuario.CLIENTE,
  emailService,
  urls: authRedirectUrls,
  onUserRegistered: hookPosRegistro,
});

/**
 * Middleware de autenticação opcional.
 * Tenta autenticar o usuário, mas não falha se não houver token.
 * Apenas injeta req.user se for bem-sucedido.
 */
const authenticateOptional = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  return authModule.authMiddleware.ensureAuthenticated(req, res, next);
};

export const { authRoutes, authMiddleware, authService } = authModule;
export { RoleUsuario };
export { authenticateOptional };
