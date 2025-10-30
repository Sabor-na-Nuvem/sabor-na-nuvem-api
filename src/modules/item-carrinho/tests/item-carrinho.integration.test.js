import supertest from 'supertest';
import { Prisma } from '@prisma/client';

// Importa o app separado (Passo 3)
import app from '../../../app.js';

// Importa os helpers de banco de dados (Passo 4)
import {
  prismaTestClient,
  setupTestDatabase,
  cleanupTestDatabase,
} from '../../../config/prismaTestHelper.js';

// Cria o "cliente" HTTP
const request = supertest(app);

// Variáveis para guardar os dados semeados (seeded data)
let loja;
let produto;
let grupoMod;
let modValido;
let modInvalido;
let usuarioDeTeste; // Usuário que fará as requisições

describe('Fluxo de Integração: Adicionar Item ao Carrinho', () => {
  // --- 1. Configuração do Banco ---

  beforeAll(async () => {
    // Roda as migrações no banco de teste ANTES de tudo
    setupTestDatabase();
  });

  beforeEach(async () => {
    // LIMPA o banco e semeia dados novos ANTES DE CADA teste
    await cleanupTestDatabase();

    // Cria um usuário de teste
    // (O `id` é definido manualmente para que possamos usá-lo no header)
    usuarioDeTeste = await prismaTestClient.usuario.create({
      data: {
        id: 'uuid-user-teste-123',
        nome: 'Usuario de Teste',
        email: 'teste@dominio.com',
      },
    });

    // Cria loja
    loja = await prismaTestClient.loja.create({
      data: {
        nome: 'Loja de Teste',
        cnpj: '12345678901234',
        // (Tive que adicionar os campos obrigatórios do seu schema)
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
        carrinhoId: 'dummy-carrinho-id',
      },
    });

    // Cria categoria
    const categoria = await prismaTestClient.categoriaProduto.create({
      data: { nome: 'Lanches' },
    });

    // Cria produto
    produto = await prismaTestClient.produto.create({
      data: {
        nome: 'X-Burger Teste',
        categoriaId: categoria.id,
      },
    });

    // Coloca o produto na loja
    await prismaTestClient.produtosEmLoja.create({
      data: {
        lojaId: loja.id,
        produtoId: produto.id,
        disponivel: true,
        valorBase: new Prisma.Decimal(20.0),
        emPromocao: false,
      },
    });

    // Cria um grupo de modificadores (ex: Tamanho, Mín 1, Máx 1)
    grupoMod = await prismaTestClient.personalizavel.create({
      data: {
        produtoId: produto.id,
        nome: 'Tamanho',
        selecaoMinima: 1,
        selecaoMaxima: 1,
      },
    });

    // Cria um modificador VÁLIDO
    modValido = await prismaTestClient.modificador.create({
      data: {
        personalizavelId: grupoMod.id,
        nome: 'Médio',
      },
    });
    // Coloca o mod válido na loja
    await prismaTestClient.modificadorEmLoja.create({
      data: {
        lojaId: loja.id,
        modificadorId: modValido.id,
        disponivel: true,
        valorAdicional: new Prisma.Decimal(5.0),
      },
    });

    // Cria um modificador INVÁLIDO (não está na loja)
    modInvalido = await prismaTestClient.modificador.create({
      data: {
        personalizavelId: grupoMod.id,
        nome: 'Grande',
      },
    });
  });

  afterAll(async () => {
    // Desconecta o cliente do banco de teste
    await prismaTestClient.$disconnect();
  });

  // --- 2. Os Testes ---

  it('deve adicionar um item ao carrinho com sucesso (201)', async () => {
    const dadosItem = {
      produtoId: produto.id,
      qtdProduto: 2,
      idLoja: loja.id, // O serviço 'adicionarItemAoCarrinho' exige 'idLoja' no body
      modificadores: [{ modificadorId: modValido.id }],
    };

    // Envia a requisição HTTP
    const response = await request
      .post('/api/usuarios/me/carrinho/itens') // Rota completa
      .send(dadosItem)
      .set('X-Test-User-Id', usuarioDeTeste.id); // Header de autenticação mock

    // Verifica a Resposta HTTP (baseado no seu controller)
    expect(response.status).toBe(201);

    // Verifica o Corpo da Resposta
    expect(response.body.subtotal).toBe('50.00'); // (20 + 5) * 2
    expect(response.body.itensNoCarrinho).toHaveLength(1);
    expect(response.body.itensNoCarrinho[0].produtoId).toBe(produto.id);
    expect(
      response.body.itensNoCarrinho[0].modificadoresSelecionados[0]
        .modificadorId,
    ).toBe(modValido.id);

    // Verifica o Banco de Dados (Prova final)
    const carrinhoNoDb = await prismaTestClient.carrinho.findUnique({
      where: { id: usuarioDeTeste.id },
      include: { itensNoCarrinho: true },
    });
    expect(carrinhoNoDb).not.toBeNull();
    expect(carrinhoNoDb.lojaId).toBe(loja.id);
    expect(carrinhoNoDb.itensNoCarrinho).toHaveLength(1);
  });

  it('deve falhar (400) ao adicionar item com modificador indisponível', async () => {
    const dadosItem = {
      produtoId: produto.id,
      qtdProduto: 1,
      idLoja: loja.id,
      modificadores: [{ modificadorId: modInvalido.id }], // Modificador "Grande"
    };

    const response = await request
      .post('/api/usuarios/me/carrinho/itens') // Rota completa
      .send(dadosItem)
      .set('X-Test-User-Id', usuarioDeTeste.id); // Auth mock

    // Verifica a Resposta HTTP (baseado no seu controller)
    // O serviço joga erro "indisponível", o controller captura e retorna 400
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('indisponível');
    expect(response.body.message).toContain('Grande'); // (O nome do mod)

    // Verifica o Banco de Dados
    const itensNoDb = await prismaTestClient.itemCarrinho.count({
      where: { carrinhoId: usuarioDeTeste.id },
    });
    expect(itensNoDb).toBe(0); // Nenhum item deve ter sido criado
  });

  it('deve falhar (400) se a regra de seleção mínima não for atendida', async () => {
    const dadosItem = {
      produtoId: produto.id,
      qtdProduto: 1,
      idLoja: loja.id,
      modificadores: [], // Grupo "Tamanho" exige Mín 1, estamos enviando 0
    };

    const response = await request
      .post('/api/usuarios/me/carrinho/itens')
      .send(dadosItem)
      .set('X-Test-User-Id', usuarioDeTeste.id);

    // O serviço joga erro "Seleção obrigatória faltante", o controller retorna 500
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Seleção obrigatória faltante');
  });

  it('deve falhar (401) se o header de autenticação não for enviado', async () => {
    const dadosItem = {
      produtoId: produto.id,
      qtdProduto: 1,
      idLoja: loja.id,
      modificadores: [{ modificadorId: modValido.id }],
    };

    const response = await request
      .post('/api/usuarios/me/carrinho/itens')
      .send(dadosItem); // <-- Sem o header 'X-Test-User-Id'

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Usuário não autenticado.');
  });
});
