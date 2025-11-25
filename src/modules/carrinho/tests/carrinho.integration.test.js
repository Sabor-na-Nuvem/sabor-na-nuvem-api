import { jest } from '@jest/globals';
import supertest from 'supertest';
// eslint-disable-next-line no-unused-vars
import { Prisma, TipoPedido, RoleUsuario } from '@prisma/client';

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
let lojaA; // Loja Antiga
let lojaB; // Loja Nova
let produtoX; // X-Burger (Existe nas duas lojas)
let produtoY; // Batata Frita (Só existe na Loja A)
let modPaoBrioche; // Padrão (Existe nas duas)
let modPaoAus; // Opção (Só existe na Loja A)
let modBacon; // Extra (Só existe na Loja A)
// ---------------------------------------------------------------------

describe('Fluxo de Integração: Mudar de Loja no Carrinho', () => {
  // --- 1. Configuração do Banco ---

  beforeAll(async () => {
    // Roda as migrações no banco de teste ANTES de tudo
    setupTestDatabase();
  });

  beforeEach(async () => {
    // LIMPA o banco e semeia dados novos ANTES DE CADA teste
    await cleanupTestDatabase();

    // --- Início da Semeadura (Seeding) ---

    // 1. Usuário
    usuarioCliente = await prismaTestClient.usuario.create({
      data: {
        id: 'uuid-user-change-store-123',
        nome: 'Usuario Troca Loja',
        email: 'troca@teste.com',
        senha: 'senha-de-teste-invalida',
      },
    });

    // 2. Lojas
    lojaA = await prismaTestClient.loja.create({
      data: {
        nome: 'Loja A (Antiga)',
        cnpj: '11111111111111',
        endereco: {
          create: {
            cep: '11111-111',
            estado: 'SP',
            cidade: 'Cidade A',
            bairro: 'Bairro A',
            logradouro: 'Rua A',
            numero: '1',
          },
        },
        horarioFuncionamento: '10:00-20:00',
        ofereceDelivery: true,
      },
    });
    lojaB = await prismaTestClient.loja.create({
      data: {
        nome: 'Loja B (Nova)',
        cnpj: '22222222222222',
        endereco: {
          create: {
            cep: '22222-222',
            estado: 'RJ',
            cidade: 'Cidade B',
            bairro: 'Bairro B',
            logradouro: 'Rua B',
            numero: '2',
          },
        },
        horarioFuncionamento: '10:00-20:00',
        ofereceDelivery: true,
      },
    });

    // 3. Produtos e Categoria
    const categoria = await prismaTestClient.categoriaProduto.create({
      data: { nome: 'Lanches Teste' },
    });
    produtoX = await prismaTestClient.produto.create({
      data: { nome: 'X-Burger', categoriaId: categoria.id },
    });
    produtoY = await prismaTestClient.produto.create({
      data: { nome: 'Batata Frita', categoriaId: categoria.id },
    });

    // 4. Personalizações do Produto X (X-Burger)
    const grupoPao = await prismaTestClient.personalizavel.create({
      data: {
        produtoId: produtoX.id,
        nome: 'Pão',
        selecaoMinima: 1,
        selecaoMaxima: 1,
      },
    });
    const grupoExtra = await prismaTestClient.personalizavel.create({
      data: {
        produtoId: produtoX.id,
        nome: 'Extra',
        selecaoMinima: 0,
        selecaoMaxima: 1,
      },
    });

    // 5. Modificadores
    modPaoBrioche = await prismaTestClient.modificador.create({
      data: {
        personalizavelId: grupoPao.id,
        nome: 'Pão Brioche',
        isOpcaoPadrao: true,
      },
    });
    modPaoAus = await prismaTestClient.modificador.create({
      data: {
        personalizavelId: grupoPao.id,
        nome: 'Pão Australiano',
        isOpcaoPadrao: false,
      },
    });
    modBacon = await prismaTestClient.modificador.create({
      data: { personalizavelId: grupoExtra.id, nome: 'Bacon Extra' },
    });

    // 6. Semeia Loja A (ANTIGA)
    await prismaTestClient.produtosEmLoja.create({
      data: {
        lojaId: lojaA.id,
        produtoId: produtoX.id,
        disponivel: true,
        valorBase: new Prisma.Decimal(10.0),
        emPromocao: false,
      },
    });
    await prismaTestClient.produtosEmLoja.create({
      data: {
        lojaId: lojaA.id,
        produtoId: produtoY.id,
        disponivel: true,
        valorBase: new Prisma.Decimal(5.0),
        emPromocao: false,
      },
    });
    await prismaTestClient.modificadorEmLoja.create({
      data: {
        lojaId: lojaA.id,
        modificadorId: modPaoBrioche.id,
        disponivel: true,
        valorAdicional: 0.0,
      },
    });
    await prismaTestClient.modificadorEmLoja.create({
      data: {
        lojaId: lojaA.id,
        modificadorId: modPaoAus.id,
        disponivel: true,
        valorAdicional: 1.0,
      },
    });
    await prismaTestClient.modificadorEmLoja.create({
      data: {
        lojaId: lojaA.id,
        modificadorId: modBacon.id,
        disponivel: true,
        valorAdicional: 3.0,
      },
    });

    // 7. Semeia Loja B (NOVA)
    await prismaTestClient.produtosEmLoja.create({
      data: {
        lojaId: lojaB.id,
        produtoId: produtoX.id,
        disponivel: true,
        valorBase: new Prisma.Decimal(12.0),
        emPromocao: false,
      },
    }); // Preço diferente
    // Produto Y (Batata) NÃO existe na Loja B
    await prismaTestClient.modificadorEmLoja.create({
      data: {
        lojaId: lojaB.id,
        modificadorId: modPaoBrioche.id,
        disponivel: true,
        valorAdicional: 0.5,
      },
    }); // Padrão existe, preço diferente
    // Modificador Pão Australiano NÃO existe na Loja B
    // Modificador Bacon Extra NÃO existe na Loja B

    // 8. Cria o Carrinho do Usuário na Loja A
    const carrinho = await prismaTestClient.carrinho.create({
      data: {
        id: usuarioCliente.id,
        lojaId: lojaA.id,
        tipo: TipoPedido.ENTREGA,
      },
    });

    // 9. Adiciona Itens ao Carrinho (na Loja A)
    // Item 1: X-Burger (Produto X) com Pão Australiano (M2) e Bacon (M3)
    const itemBurger = await prismaTestClient.itemCarrinho.create({
      data: {
        carrinhoId: carrinho.id,
        produtoId: produtoX.id,
        qtdProduto: 1,
        valorUnitarioProduto: new Prisma.Decimal(10.0), // Preço Loja A
      },
    });
    await prismaTestClient.itemCarrinhoModificadores.create({
      data: {
        itemCarrinhoId: itemBurger.id,
        modificadorId: modPaoAus.id,
        valorAdicionalCobrado: 1.0,
      },
    });
    await prismaTestClient.itemCarrinhoModificadores.create({
      data: {
        itemCarrinhoId: itemBurger.id,
        modificadorId: modBacon.id,
        valorAdicionalCobrado: 3.0,
      },
    });

    // Item 2: Batata Frita (Produto Y)
    await prismaTestClient.itemCarrinho.create({
      data: {
        carrinhoId: carrinho.id,
        produtoId: produtoY.id,
        qtdProduto: 2,
        valorUnitarioProduto: new Prisma.Decimal(5.0),
      },
    });
    // --- Fim da Semeadura ---
  });

  afterAll(async () => {
    // Desconecta o cliente do banco de teste
    await prismaTestClient.$disconnect();
  });

  // --- 2. O Teste ---

  it('deve revalidar o carrinho, remover/ajustar itens e retornar avisos (200)', async () => {
    // --- Arrange (Given) ---
    const body = {
      lojaId: lojaB.id, // Muda para Loja B
    };

    // Verifica o estado ANTES da chamada
    const itensAntes = await prismaTestClient.itemCarrinho.count();
    const modsAntes = await prismaTestClient.itemCarrinhoModificadores.count();
    expect(itensAntes).toBe(2); // X-Burger e Batata
    expect(modsAntes).toBe(2); // Pão Aus e Bacon

    // --- Act (When) ---
    const response = await request
      .patch('/api/usuarios/me/carrinho') // Rota do carrinho
      .set('X-Test-User-Id', usuarioCliente.id) // Autentica
      .send(body);

    // --- Assert (Resposta HTTP) ---
    expect(response.status).toBe(200);

    // 1. Verifica os Avisos (a parte mais importante)
    expect(response.body.avisos).toHaveLength(4);
    expect(response.body.avisos).toEqual(
      expect.arrayContaining([
        // Aviso de remoção do item (Batata)
        "Item 'Batata Frita' foi removido (indisponível na nova loja).",
        // Avisos de remoção dos modificadores do X-Burger
        "Opção 'Pão Australiano' foi removida do item 'X-Burger' (indisponível na nova loja).",
        "Opção 'Bacon Extra' foi removida do item 'X-Burger' (indisponível na nova loja).",
        // Aviso de adição do modificador padrão (Pão Brioche)
        "Opção do item 'X-Burger' foi alterada para 'Pão Brioche' (opção padrão).",
      ]),
    );

    // 2. Verifica o Carrinho retornado
    const carrinhoResposta = response.body.carrinho;
    expect(carrinhoResposta.lojaId).toBe(lojaB.id); // Mudou para Loja B
    expect(carrinhoResposta.itensNoCarrinho).toHaveLength(1); // Só o X-Burger sobrou

    // 3. Verifica o Item (X-Burger)
    const itemBurgerResposta = carrinhoResposta.itensNoCarrinho[0];
    expect(itemBurgerResposta.produtoId).toBe(produtoX.id);
    expect(Number(itemBurgerResposta.valorUnitarioProduto)).toBeCloseTo(12.0); // Preço da Loja B

    // 4. Verifica os Modificadores (só deve ter o Pão Brioche)
    expect(itemBurgerResposta.modificadoresSelecionados).toHaveLength(1);
    const modResposta = itemBurgerResposta.modificadoresSelecionados[0];
    expect(modResposta.modificadorId).toBe(modPaoBrioche.id);
    // Converte para número
    expect(Number(modResposta.valorAdicionalCobrado)).toBeCloseTo(0.5); // Preço da Loja B

    // 5. Verifica o Subtotal
    // (12.00 [prod] + 0.50 [mod]) * 1 [qtd] = 12.50
    // Converte para número
    expect(Number(carrinhoResposta.subtotal)).toBeCloseTo(12.5);

    // --- Assert (Estado do Banco de Dados) ---

    // 1. Carrinho principal foi atualizado
    const carrinhoNoDb = await prismaTestClient.carrinho.findUnique({
      where: { id: usuarioCliente.id },
    });
    expect(carrinhoNoDb.lojaId).toBe(lojaB.id);

    // 2. Item Batata foi DELETADO
    const itensNoDb = await prismaTestClient.itemCarrinho.count();
    expect(itensNoDb).toBe(1);

    // 3. Modificadores Pão Aus e Bacon foram DELETADOS, Pão Brioche foi CRIADO
    const modsNoDb = await prismaTestClient.itemCarrinhoModificadores.count();
    expect(modsNoDb).toBe(1);

    const modFinalNoDb =
      await prismaTestClient.itemCarrinhoModificadores.findFirst();
    expect(modFinalNoDb.modificadorId).toBe(modPaoBrioche.id);
  });
});
