import { createAuthModule } from '@joaoschmitz/express-prisma-auth';
import { RoleUsuario } from '@prisma/client';
import sgMail from '@sendgrid/mail';
import prisma from './prisma.js';

// --- CONFIGURAÇÃO DE AMBIENTE ---
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || `http://localhost:${process.env.PORT}`;

// --- CONFIGURAÇÃO DO TRANSPORTER DE EMAIL ---
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Função auxiliar para enviar email
const sendMail = async (to, subject, html) => {
  const msg = {
    to,
    from: process.env.SMTP_FROM || 'App <noreply@app.com>',
    subject,
    html,
  };

  // Sua lógica de ambiente (PROD vs DEV) permanece ótima
  if (process.env.NODE_ENV === 'production' || process.env.FORCE_EMAIL) {
    try {
      const [response] = await sgMail.send(msg);

      // O SendGrid retorna um código 202 para sucesso
      console.log(
        `[EMAIL ENVIADO - SG] Para: ${to} | Status: ${response.statusCode}`,
      );
    } catch (error) {
      // Tratamento de erro específico do SendGrid (pode incluir mais detalhes no body)
      console.error('[ERRO EMAIL - SG]', error.response?.body || error);
    }
  } else {
    // Log de desenvolvimento
    console.log(`[DEV EMAIL MOCK] Para: ${to} | Assunto: ${subject}`);
    console.log(html);
  }
};

const emailService = {
  sendVerificationEmail: async (to, token) => {
    // Backend valida o email
    const url = `${API_URL}/api/auth/verify-email?token=${token}`;
    await sendMail(
      to,
      'Verifique seu e-mail',
      `<p>Bem-vindo! Clique no link para verificar sua conta:</p>
       <a href="${url}">${url}</a>`,
    );
  },

  sendPasswordResetEmail: async (to, token) => {
    // Frontend reseta a senha
    const url = `${FRONTEND_URL}/reset-password?token=${token}`;
    await sendMail(
      to,
      'Redefinição de Senha',
      `<p>Você solicitou a troca de senha. Clique abaixo para alterar:</p>
       <a href="${url}">Redefinir Senha</a>`,
    );
  },

  sendUpdateEmailConfirmation: async (to, token) => {
    // Backend confirma a troca
    const url = `${API_URL}/api/auth/verify-email-update?token=${token}`;
    await sendMail(
      to,
      'Confirme seu novo e-mail',
      `<p>Clique no link para confirmar a alteração do seu e-mail:</p>
       <a href="${url}">${url}</a>`,
    );
  },
};

const authRedirectUrls = {
  // Redireciona para o Front após verificar email
  emailVerifySuccess: `${FRONTEND_URL}/login?message=email-verificado`,
  emailVerifyError: `${FRONTEND_URL}/login?error=verificacao-falhou`,

  // Redireciona para a própria API (que retorna JSON) após resetar senha
  passwordResetSuccess: `${API_URL}/api/auth/redirect-success`,
  passwordResetError: `${API_URL}/api/auth/redirect-error`,

  // Redireciona para o Front (Perfil) após atualizar email
  emailUpdateSuccess: `${FRONTEND_URL}/minha-conta/info?message=email-atualizado`,
  emailUpdateError: `${FRONTEND_URL}/minha-conta/info?error=email-atualizacao-falhou`,
};

const hookPosRegistro = async (tx, novoUsuario, dadosExtras) => {
  // Cria o relatório (obrigatório)
  if (!dadosExtras?.userExists) {
    await tx.relatorioUsuario.create({
      data: {
        usuarioId: novoUsuario.id,
      },
    });
  }

  // Verifica e cria Endereço (se enviado pelo frontend)
  if (dadosExtras?.endereco) {
    const dadosEndereco = {
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
    };

    await tx.usuario.update({
      where: { id: novoUsuario.id },
      data: {
        endereco: {
          upsert: {
            create: dadosEndereco,
            update: dadosEndereco,
          },
        },
      },
    });
  }

  // Verifica e cria Telefones (se enviado pelo frontend)
  if (dadosExtras?.telefones && Array.isArray(dadosExtras.telefones)) {
    // SE O USUÁRIO JÁ EXISTIA: Limpa os telefones antigos para não duplicar
    if (dadosExtras.userExists) {
      await tx.telefone.deleteMany({
        where: { usuarioId: novoUsuario.id },
      });
    }
    // Cria os novos telefones
    if (dadosExtras.telefones.length > 0) {
      await tx.telefone.createMany({
        data: dadosExtras.telefones.map((tel) => ({
          ddd: tel.ddd,
          numero: tel.numero,
          usuarioId: novoUsuario.id,
        })),
      });
    }
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
