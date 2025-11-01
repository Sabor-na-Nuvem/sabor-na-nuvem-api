import { jest } from '@jest/globals';
import supertest from 'supertest';
import { Prisma, TipoDesconto, TipoPedido, RoleUsuario } from '@prisma/client';

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
let usuarioDeTeste;
let loja;
let produto;
let modValido;
let cupomValido;
let carrinho;
let itemCarrinho;
// ---------------------------------------------------------------------

describe('Fluxo de Integração: Criar Pedido', () => {
  // --- 1. Configuração do Banco ---

  beforeAll(async () => {
    // Roda as migrações no banco de teste ANTES de tudo
    setupTestDatabase();
  });

  beforeEach(async () => {
    // LIMPA o banco e semeia dados novos ANTES DE CADA teste
    await cleanupTestDatabase();

    // --- Início da Semeadura (Seeding) ---
    // Precisamos criar um ecossistema completo para um pedido

    // 1. Usuário
    usuarioDeTeste = await prismaTestClient.usuario.create({
      data: {
        id: 'uuid-user-pedido-123',
        nome: 'Usuario de Teste Pedido',
        email: 'pedido@teste.com',
        senha: 'senha-de-teste-invalida',
      },
    });

    // 2. Loja
    loja = await prismaTestClient.loja.create({
      data: {
        nome: 'Loja de Pedido Teste',
        cnpj: '11111111111111',
        endereco: {
          create: {
            cep: '12345-678',
            estado: 'SP',
            cidade: 'Cidadela',
            bairro: 'Centro',
            logradouro: 'Rua dos Testes',
            numero: '123',
          },
        },
        horarioFuncionamento: '08:00-18:00',
        ofereceDelivery: true,
        carrinhoId: 'dummy-carrinho-id', // (Obrigatório do schema)
      },
    });

    // 3. Produto
    const categoria = await prismaTestClient.categoriaProduto.create({
      data: { nome: 'Lanches Teste' },
    });
    produto = await prismaTestClient.produto.create({
      data: { nome: 'Super Burger', categoriaId: categoria.id },
    });
    await prismaTestClient.produtosEmLoja.create({
      data: {
        lojaId: loja.id,
        produtoId: produto.id,
        disponivel: true,
        valorBase: new Prisma.Decimal(30.0), // Preço Base: 30.00
        emPromocao: false,
      },
    });

    // 4. Modificador
    const grupoMod = await prismaTestClient.personalizavel.create({
      data: {
        produtoId: produto.id,
        nome: 'Extra',
        selecaoMinima: 0,
        selecaoMaxima: 1,
      },
    });
    modValido = await prismaTestClient.modificador.create({
      data: { personalizavelId: grupoMod.id, nome: 'Bacon Extra' },
    });
    await prismaTestClient.modificadorEmLoja.create({
      data: {
        lojaId: loja.id,
        modificadorId: modValido.id,
        disponivel: true,
        valorAdicional: new Prisma.Decimal(5.0), // Preço Mod: 5.00
      },
    });

    // 5. Cupom (VALOR_FIXO, 1 uso restante)
    cupomValido = await prismaTestClient.cupomDesconto.create({
      data: {
        codCupom: 'DEZREAIS',
        validade: new Date(Date.now() + 1000 * 60 * 60 * 24), // Válido por 1 dia
        qtdUsos: 1, // APENAS 1 USO
        ativo: true,
        tipoDesconto: TipoDesconto.VALOR_FIXO,
        valorDesconto: new Prisma.Decimal(10.0), // Desconto: 10.00
      },
    });

    // 6. Carrinho (finalmente)
    carrinho = await prismaTestClient.carrinho.create({
      data: {
        id: usuarioDeTeste.id, // Linka ao usuário
        lojaId: loja.id, // Linka à loja
        tipo: TipoPedido.ENTREGA,
      },
    });

    // 7. Item no Carrinho
    itemCarrinho = await prismaTestClient.itemCarrinho.create({
      data: {
        carrinhoId: carrinho.id,
        produtoId: produto.id,
        qtdProduto: 2, // 2 unidades
        valorUnitarioProduto: new Prisma.Decimal(30.0), // Preço congelado do produto
      },
    });

    // 8. Modificador no Item do Carrinho
    await prismaTestClient.itemCarrinhoModificadores.create({
      data: {
        itemCarrinhoId: itemCarrinho.id,
        modificadorId: modValido.id,
        valorAdicionalCobrado: new Prisma.Decimal(5.0), // Preço congelado do mod
      },
    });

    // --- Fim da Semeadura ---
    // Valor Base Esperado = (30.00 [prod] + 5.00 [mod]) * 2 [qtd] = 70.00
    // Valor Cobrado Esperado = 70.00 - 10.00 [cupom] = 60.00
  });

  afterAll(async () => {
    // Desconecta o cliente do banco de teste
    await prismaTestClient.$disconnect();
  });

  // --- 2. Os Testes ---

  it('deve criar um pedido com sucesso, usar o cupom e limpar o carrinho (201)', async () => {
    // --- Arrange ---
    const dadosInput = {
      codCupom: cupomValido.codCupom, // "DEZREAIS"
      observacoes: 'Teste de integração',
    };

    // Verifica o estado ANTES da chamada
    const itensNoCarrinhoAntes = await prismaTestClient.itemCarrinho.count();
    const cupomAntes = await prismaTestClient.cupomDesconto.findUnique({
      where: { id: cupomValido.id },
    });
    expect(itensNoCarrinhoAntes).toBe(1); // Garante que o item está lá
    expect(cupomAntes.qtdUsos).toBe(1); // Garante que o cupom é válido
    expect(cupomAntes.ativo).toBe(true);

    // --- Act ---
    const response = await request
      .post('/api/pedidos') // Rota de criação de pedido
      .set('X-Test-User-Id', usuarioDeTeste.id) // Autentica como nosso usuário
      .send(dadosInput);

    // --- Assert (Resposta HTTP) ---
    expect(response.status).toBe(201);
    expect(response.body.clienteId).toBe(usuarioDeTeste.id);
    expect(response.body.lojaId).toBe(loja.id);
    expect(response.body.cupomUsadoId).toBe(cupomValido.id);

    // Verifica os valores (calculados no beforeEach)
    // (O Prisma retorna strings para Decimais)
    expect(Number(response.body.valorBase)).toBeCloseTo(70.0);
    expect(Number(response.body.valorCobrado)).toBeCloseTo(60.0);

    // Verifica se os itens do pedido foram criados
    expect(response.body.itensNoPedido).toHaveLength(1);
    expect(response.body.itensNoPedido[0].produtoId).toBe(produto.id);
    expect(
      response.body.itensNoPedido[0].modificadoresSelecionados,
    ).toHaveLength(1);
    expect(
      response.body.itensNoPedido[0].modificadoresSelecionados[0].modificadorId,
    ).toBe(modValido.id);

    // --- Assert (Estado do Banco de Dados) ---

    // 1. Pedido foi criado
    const pedidoCriado = await prismaTestClient.pedido.count();
    expect(pedidoCriado).toBe(1);

    // 2. Carrinho foi limpo (CRÍTICO)
    const itensNoCarrinhoDepois = await prismaTestClient.itemCarrinho.count();
    expect(itensNoCarrinhoDepois).toBe(0);

    // 3. Cupom foi USADO (CRÍTICO)
    // (Lógica do cupomService: qtdUsos=1 -> decrementa para 0 e desativa)
    const cupomDepois = await prismaTestClient.cupomDesconto.findUnique({
      where: { id: cupomValido.id },
    });
    expect(cupomDepois.qtdUsos).toBe(0);
    expect(cupomDepois.ativo).toBe(false);
  });

  it('deve falhar (400) se o cupom for inválido', async () => {
    // --- Arrange ---
    const dadosInput = { codCupom: 'CUPOM-FALSO' };

    // --- Act ---
    const response = await request
      .post('/api/pedidos')
      .set('X-Test-User-Id', usuarioDeTeste.id)
      .send(dadosInput);

    // --- Assert ---
    // (O controller captura 'não encontrado' e retorna 404, mas 'expirado'/'inválido' como 500)
    // Vamos testar o 'não encontrado' que o controller mapeia para 404
    expect(response.status).toBe(404);
    expect(response.body.message).toContain(
      'Cupom "CUPOM-FALSO" não encontrado',
    );

    // NADA deve ter mudado no banco (transação rollback)
    const pedidoCriado = await prismaTestClient.pedido.count();
    const itensNoCarrinho = await prismaTestClient.itemCarrinho.count();
    expect(pedidoCriado).toBe(0);
    expect(itensNoCarrinho).toBe(1); // Carrinho NÃO foi limpo
  });

  it('deve falhar (400) se o carrinho estiver vazio', async () => {
    // --- Arrange ---
    // Remove o item do carrinho semeado no beforeEach
    await prismaTestClient.itemCarrinho.delete({
      where: { id: itemCarrinho.id },
    });

    const itensNoCarrinhoAntes = await prismaTestClient.itemCarrinho.count();
    expect(itensNoCarrinhoAntes).toBe(0); // Garante que está vazio

    // --- Act ---
    const response = await request
      .post('/api/pedidos')
      .set('X-Test-User-Id', usuarioDeTeste.id)
      .send({});

    // --- Assert ---
    // (O controller mapeia 'carrinho' para 400)
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('O carrinho está vazio.');
  });
});
