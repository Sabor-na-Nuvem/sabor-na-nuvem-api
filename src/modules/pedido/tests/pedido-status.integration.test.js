import { jest } from '@jest/globals';
import supertest from 'supertest';
import { Prisma, StatusPedido, RoleUsuario } from '@prisma/client';

// Importa o app (Express)
import app from '../../../app.js';

// Importa os helpers de banco de dados
import {
  prismaTestClient,
  setupTestDatabase,
  cleanupTestDatabase,
} from '../../../config/prismaTestHelper.js';

// --- INÍCIO DO MOCK MANUAL ---
jest.mock(
  '../../../config/authModule.js',
  () => {
    // Importa o enum real *dentro* do mock
    const { RoleUsuario: MockedRoleUsuario } =
      jest.requireActual('@prisma/client');

    // Cria o middleware opcional mockado
    const mockAuthenticateOptional = (req, res, next) => {
      const testUserId = req.headers['x-test-user-id'];
      if (testUserId) {
        req.user = { id: testUserId, cargo: MockedRoleUsuario.ADMIN };
      }
      next(); // Nunca falha
    };

    const mockEnsureAuthenticated = (req, res, next) => {
      const testUserId = req.headers['x-test-user-id'];
      if (testUserId) {
        req.user = { id: testUserId, cargo: MockedRoleUsuario.ADMIN };
        return next();
      }
      return res.status(401).json({ message: 'Token não fornecido (mock)' });
    };

    const mockEnsureRole = (allowedRoles) => (req, res, next) => {
      if (req.user && allowedRoles.includes(req.user.cargo)) {
        return next();
      }
      return res.status(403).json({ message: 'Acesso negado (mock)' });
    };

    return {
      authRoutes: jest.fn(),
      authMiddleware: {
        ensureAuthenticated: mockEnsureAuthenticated,
        ensureRole: mockEnsureRole,
      },
      authenticateOptional: mockAuthenticateOptional,
      RoleUsuario: MockedRoleUsuario,
    };
  },
  { virtual: true },
);
// --- FIM DO MOCK MANUAL ---

// Cria o "cliente" HTTP
const request = supertest(app);

// --- Variáveis de Teste (para compartilhar entre o beforeEach e os 'it') ---
let usuarioCliente;
let loja;
let pedido;
// ---------------------------------------------------------------------

describe('Fluxo de Integração: Atualizar Status do Pedido (Fidelidade)', () => {
  // --- 1. Configuração do Banco ---

  beforeAll(async () => {
    // Roda as migrações no banco de teste ANTES de tudo
    setupTestDatabase();
  });

  beforeEach(async () => {
    // LIMPA o banco e semeia dados novos ANTES DE CADA teste
    await cleanupTestDatabase();

    // --- Início da Semeadura (Seeding) ---

    // 1. Usuário (O Cliente dono do pedido)
    usuarioCliente = await prismaTestClient.usuario.create({
      data: {
        id: 'uuid-user-fidelidade-123',
        nome: 'Usuario Cliente Fiel',
        email: 'fiel@teste.com',
        senha: 'senha-de-teste-invalida',
      },
    });

    // 2. Relatório de Usuário (CRÍTICO)
    // Começa com 80 reais em gastos, para que o próximo pedido ultrapasse o limiar de 100
    await prismaTestClient.relatorioUsuario.create({
      data: {
        usuarioId: usuarioCliente.id,
        gastoDesdeUltimoCupom: new Prisma.Decimal(80.0),
      },
    });

    // 3. Loja
    loja = await prismaTestClient.loja.create({
      data: {
        nome: 'Loja Fidelidade Teste',
        cnpj: '22222222222222',
        endereco: {
          create: {
            cep: '12345-000',
            estado: 'SP',
            cidade: 'Cidadela',
            bairro: 'Centro',
            logradouro: 'Rua da Fidelidade',
            numero: '100',
          },
        },
        horarioFuncionamento: '10:00-20:00',
        ofereceDelivery: true,
        carrinhoId: 'dummy-carrinho-id',
      },
    });

    // 4. Pedido (O Pedido a ser finalizado)
    // Status: EM_ENTREGA (pode ir para REALIZADO)
    // Valor: 30.00 (80.00 + 30.00 = 110.00, que é > 100)
    pedido = await prismaTestClient.pedido.create({
      data: {
        clienteId: usuarioCliente.id,
        lojaId: loja.id,
        status: StatusPedido.EM_ENTREGA, // Estado anterior
        valorBase: new Prisma.Decimal(30.0),
        valorCobrado: new Prisma.Decimal(30.0),
        tipo: 'ENTREGA',
      },
    });

    // (Não precisamos semear produtos ou itens do pedido
    // pois a lógica de 'atualizarStatus' não revalida os itens,
    // ela apenas usa o 'valorCobrado' do pedido já existente)

    // --- Fim da Semeadura ---
  });

  afterAll(async () => {
    // Desconecta o cliente do banco de teste
    await prismaTestClient.$disconnect();
  });

  // --- 2. Os Testes ---

  it('deve atualizar status para REALIZADO, gerar cupom e resetar gastos (200)', async () => {
    // --- Arrange (Given) ---
    const dadosBody = {
      status: 'REALIZADO',
    };

    // Verifica o estado ANTES da chamada
    const relatorioAntes = await prismaTestClient.relatorioUsuario.findUnique({
      where: { usuarioId: usuarioCliente.id },
    });
    const cuponsAntes = await prismaTestClient.cupomDesconto.count();

    expect(relatorioAntes.gastoDesdeUltimoCupom.toNumber()).toBe(80.0);
    expect(cuponsAntes).toBe(0); // Nenhum cupom existe

    // --- Act (When) ---
    const response = await request
      .patch(`/api/pedidos/loja/${loja.id}/${pedido.id}`) // Rota da Loja
      .set('X-Test-User-Id', 'uuid-user-admin-ou-funcionario') // Autentica como um funcionário/admin
      .send(dadosBody);

    // --- Assert (Resposta HTTP) ---
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(pedido.id);
    expect(response.body.status).toBe('REALIZADO');

    // --- Assert (Estado do Banco de Dados) ---

    // 1. Pedido foi atualizado
    const pedidoDepois = await prismaTestClient.pedido.findUnique({
      where: { id: pedido.id },
    });
    expect(pedidoDepois.status).toBe(StatusPedido.REALIZADO);

    // 2. Relatório do Usuário foi atualizado (CRÍTICO)
    const relatorioDepois = await prismaTestClient.relatorioUsuario.findUnique({
      where: { usuarioId: usuarioCliente.id },
    });
    // Lógica: 80.00 (antes) + 30.00 (pedido) = 110.00
    // Limiar (100.00) foi atingido.
    // Gasto resetado: 110.00 - 100.00 = 10.00
    expect(relatorioDepois.gastoDesdeUltimoCupom.toNumber()).toBeCloseTo(10.0);
    expect(relatorioDepois.qtdTotalPedidos).toBe(1); // Foi incrementado

    // 3. Cupom de Fidelidade foi CRIADO (CRÍTICO)
    const cuponsDepois = await prismaTestClient.cupomDesconto.count();
    expect(cuponsDepois).toBe(1); // Um cupom foi criado

    const cupomCriado = await prismaTestClient.cupomDesconto.findFirst();
    expect(cupomCriado.usuarioId).toBe(usuarioCliente.id); // Pertence ao usuário correto
    expect(cupomCriado.codCupom).toContain('FID-'); // É um cupom de fidelidade
    expect(cupomCriado.qtdUsos).toBe(1); // Tem 1 uso
  });

  it('deve atualizar status para EM_PREPARO (sem gerar cupom) (200)', async () => {
    // Este teste garante que a lógica de fidelidade SÓ roda no status 'REALIZADO'

    // --- Arrange (Given) ---
    // Modifica o pedido inicial para PENDENTE
    await prismaTestClient.pedido.update({
      where: { id: pedido.id },
      data: { status: StatusPedido.PENDENTE },
    });

    const dadosBody = {
      status: 'EM_PREPARO',
    };

    const cuponsAntes = await prismaTestClient.cupomDesconto.count();
    expect(cuponsAntes).toBe(0);

    // --- Act (When) ---
    const response = await request
      .patch(`/api/pedidos/loja/${loja.id}/${pedido.id}`)
      .set('X-Test-User-Id', 'uuid-user-admin-ou-funcionario')
      .send(dadosBody);

    // --- Assert (Resposta HTTP) ---
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('EM_PREPARO');

    // --- Assert (Estado do Banco de Dados) ---

    // 1. Relatório NÃO foi atualizado (pois status não é REALIZADO)
    const relatorioDepois = await prismaTestClient.relatorioUsuario.findUnique({
      where: { usuarioId: usuarioCliente.id },
    });
    expect(relatorioDepois.gastoDesdeUltimoCupom.toNumber()).toBe(80.0); // Permanece o mesmo
    expect(relatorioDepois.qtdTotalPedidos).toBe(0); // Não foi incrementado

    // 2. NENHUM cupom foi criado
    const cuponsDepois = await prismaTestClient.cupomDesconto.count();
    expect(cuponsDepois).toBe(0);
  });

  it('deve falhar (400) se a transição de status for inválida', async () => {
    // --- Arrange (Given) ---
    // (O pedido está como EM_ENTREGA. Tentar voltar para PENDENTE é inválido)
    const dadosBody = {
      status: 'PENDENTE',
    };

    // --- Act (When) ---
    const response = await request
      .patch(`/api/pedidos/loja/${loja.id}/${pedido.id}`)
      .set('X-Test-User-Id', 'uuid-user-admin-ou-funcionario')
      .send(dadosBody);

    // --- Assert (Resposta HTTP) ---
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Transição de status inválida');
  });
});
