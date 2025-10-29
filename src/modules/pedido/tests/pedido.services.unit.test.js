/* eslint-disable no-return-await */
/* eslint-disable import/first */
import { jest } from '@jest/globals';
import { Prisma, StatusPedido, TipoDesconto, TipoPedido } from '@prisma/client';

// Mock do Prisma e da transação (pode vir antes ou depois, mas é bom agrupar)
const mockTx = {
  carrinho: { findUnique: jest.fn(), deleteMany: jest.fn() },
  produtosEmLoja: { findUnique: jest.fn(), findFirst: jest.fn() },
  modificadorEmLoja: { findUnique: jest.fn(), findFirst: jest.fn() },
  pedido: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  itemPedido: { create: jest.fn() },
  itemPedidoModificadores: { createMany: jest.fn() },
  itemCarrinho: { deleteMany: jest.fn() },
  relatorioUsuario: { update: jest.fn() },
};
// --- FIM DOS MOCKS ---

// 3. DECLARE AS VARIÁVEIS DOS MÓDULOS DINÂMICOS (sem atribuir)
let prisma;
let pedidoServices;
let cupomDescontoServices;
let helpers;

describe('Pedido Service', () => {
  beforeAll(async () => {
    const mockPrisma = {
      $transaction: jest
        .fn()
        .mockImplementation(async (callback) => await callback(mockTx)),
      pedido: { findFirst: jest.fn(), update: jest.fn() },
    };

    jest.unstable_mockModule('../../../config/prisma.js', () => ({
      default: mockPrisma,
    }));

    prisma = mockPrisma;

    // --- 2. Cupom Service Mock (NOVO) ---
    const mockCupomService = {
      validarEUsarCupom: jest.fn(),
      criarCupomFidelidade: jest.fn(),
    };
    jest.unstable_mockModule(
      '../../cupom-desconto/cupom-desconto.services.js',
      () => ({
        default: mockCupomService,
      }),
    );

    // --- 3. Helpers Mock (NOVO) ---
    const mockHelpers = {
      calcularDesconto: jest.fn((val, tipo, desc) => val.minus(desc)),
      buscarPedidoDetalhado: jest.fn(),
      listarPedidos: jest.fn(),
      includeDetalhesPedido: {
        cupom: true,
        loja: true,
        cliente: true,
        itensNoPedido: true,
      },
      transicoesPermitidas: {
        AGUARDANDO_PAGAMENTO: [StatusPedido.PENDENTE, StatusPedido.CANCELADO],
        PENDENTE: [StatusPedido.EM_PREPARO, StatusPedido.CANCELADO],
        EM_PREPARO: [
          StatusPedido.PRONTO_PARA_ENTREGA,
          StatusPedido.PRONTO_PARA_RETIRADA,
          StatusPedido.CANCELADO,
        ],
        PRONTO_PARA_ENTREGA: [StatusPedido.EM_ENTREGA],
        PRONTO_PARA_RETIRADA: [StatusPedido.REALIZADO],
        EM_ENTREGA: [StatusPedido.REALIZADO],
        CANCELADO: [],
        REALIZADO: [],
      },
    };
    // Atenção: O seu mock original de helpers não exportava um 'default',
    // então o mockModule também não deve ter.
    jest.unstable_mockModule('../pedido.helpers.js', () => mockHelpers);

    cupomDescontoServices = (
      await import('../../cupom-desconto/cupom-desconto.services.js')
    ).default;

    helpers = await import('../pedido.helpers.js');

    pedidoServices = (await import('../pedido.services.js')).default;
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Este é o ideal

    Object.values(mockTx).forEach((table) =>
      Object.values(table).forEach((fn) => fn.mockReset()),
    );

    prisma.$transaction.mockImplementation(
      async (callback) => await callback(mockTx),
    );
  });

  describe('listarMeusPedidos', () => {
    it('deve chamar listarPedidos com os args corretos', async () => {
      helpers.listarPedidos.mockResolvedValue({ pedidos: [], paginacao: {} });
      await pedidoServices.listarMeusPedidos('uuid-user-1', { page: 1 });

      expect(helpers.listarPedidos).toHaveBeenCalledWith(
        { clienteId: 'uuid-user-1' },
        { page: 1 },
        { loja: { select: { nome: true } } },
        prisma,
      );
    });
  });

  describe('buscarMeuPedidoPorId', () => {
    it('deve chamar buscarPedidoDetalhado com o where correto', async () => {
      helpers.buscarPedidoDetalhado.mockResolvedValue({ id: 1 });
      await pedidoServices.buscarMeuPedidoPorId(1, 'uuid-user-1');

      expect(helpers.buscarPedidoDetalhado).toHaveBeenCalledWith(
        { id: 1, clienteId: 'uuid-user-1' },
        prisma,
      );
    });
  });

  describe('criarPedido', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Reseta todos os mocks da transação
      Object.values(mockTx).forEach((table) =>
        Object.values(table).forEach((fn) => fn.mockReset()),
      );
    });

    // --- Mocks de Dados Padrão ---
    const mockUsuarioLogado = 'uuid-user-123';
    const mockCarrinhoDB = {
      id: mockUsuarioLogado,
      lojaId: 1,
      tipo: TipoPedido.ENTREGA,
      itensNoCarrinho: [
        {
          id: 1,
          produtoId: 101,
          qtdProduto: 1,
          valorUnitarioProduto: new Prisma.Decimal(20.0),
          produto: { nome: 'X-Burger' },
          modificadoresSelecionados: [
            {
              modificadorId: 201,
              valorAdicionalCobrado: new Prisma.Decimal(5.0),
              modificador: { nome: 'Bacon Extra' },
            },
          ],
        },
      ],
    };
    const mockProdutoEmLoja = {
      lojaId: 1,
      produtoId: 101,
      disponivel: true,
      valorBase: new Prisma.Decimal(20.0),
      // ...
    };
    const mockModEmLoja = {
      lojaId: 1,
      modificadorId: 201,
      disponivel: true,
      valorAdicional: new Prisma.Decimal(5.0),
    };
    const mockPedidoCriado = {
      id: 123,
      clienteId: mockUsuarioLogado,
      lojaId: 1,
      valorBase: new Prisma.Decimal(25.0),
      valorCobrado: new Prisma.Decimal(25.0),
      // ...
    };
    const mockItemPedidoCriado = {
      id: 501,
      pedidoId: 123,
      produtoId: 101,
      // ...
    };

    it('deve criar um pedido com sucesso para um usuário logado', async () => {
      // 1. Setup dos Mocks
      mockTx.carrinho.findUnique.mockResolvedValue(mockCarrinhoDB);
      mockTx.produtosEmLoja.findFirst.mockResolvedValue(mockProdutoEmLoja);
      mockTx.modificadorEmLoja.findUnique.mockResolvedValue(mockModEmLoja);
      mockTx.pedido.create.mockResolvedValue(mockPedidoCriado);
      mockTx.itemPedido.create.mockResolvedValue(mockItemPedidoCriado);
      // (cupomDescontoServices.validarEUsarCupom não será chamado)

      // 2. Execução
      const dadosInput = { observacoes: 'Capricha!' };
      await pedidoServices.criarPedido(mockUsuarioLogado, dadosInput);

      // 3. Verificação
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockTx.carrinho.findUnique).toHaveBeenCalledWith({
        where: { id: mockUsuarioLogado },
        include: expect.any(Object),
      });
      expect(mockTx.produtosEmLoja.findFirst).toHaveBeenCalledTimes(1);
      expect(mockTx.modificadorEmLoja.findUnique).toHaveBeenCalledTimes(1);
      expect(mockTx.pedido.create).toHaveBeenCalledTimes(1);
      expect(mockTx.itemPedido.create).toHaveBeenCalledTimes(1);
      expect(mockTx.itemPedidoModificadores.createMany).toHaveBeenCalledTimes(
        1,
      );
      expect(mockTx.itemCarrinho.deleteMany).toHaveBeenCalledWith({
        where: { carrinhoId: mockUsuarioLogado },
      });
      // Verifica se o relatório NÃO foi atualizado (pois a lógica foi movida)
      expect(mockTx.relatorioUsuario.update).not.toHaveBeenCalled();
    });

    it('deve criar um pedido com sucesso para um usuário anônimo (carrinho mockado)', async () => {
      // 1. Setup (mockCarrinhoDB é usado como o carrinho mockado)
      const dadosInput = {
        observacoes: 'Entrega rápida',
        carrinho: mockCarrinhoDB, // Passa o carrinho no input
      };

      mockTx.produtosEmLoja.findFirst.mockResolvedValue(mockProdutoEmLoja);
      mockTx.modificadorEmLoja.findUnique.mockResolvedValue(mockModEmLoja);
      mockTx.pedido.create.mockResolvedValue(mockPedidoCriado);
      mockTx.itemPedido.create.mockResolvedValue(mockItemPedidoCriado);

      // 2. Execução
      await pedidoServices.criarPedido(null, dadosInput); // idUsuario é null

      // 3. Verificação
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockTx.carrinho.findUnique).not.toHaveBeenCalled(); // Não busca carrinho do banco
      expect(mockTx.pedido.create).toHaveBeenCalledTimes(1);
      expect(mockTx.itemPedido.create).toHaveBeenCalledTimes(1);
      expect(mockTx.itemPedidoModificadores.createMany).toHaveBeenCalledTimes(
        1,
      );
      // NÃO deve limpar o carrinho, pois é anônimo
      expect(mockTx.itemCarrinho.deleteMany).not.toHaveBeenCalled();
    });

    it('deve lançar erro se o carrinho estiver vazio (usuário logado)', async () => {
      // 1. Setup
      const mockCarrinhoVazio = { ...mockCarrinhoDB, itensNoCarrinho: [] };
      mockTx.carrinho.findUnique.mockResolvedValue(mockCarrinhoVazio);

      // 2. Execução e 3. Verificação
      await expect(
        pedidoServices.criarPedido(mockUsuarioLogado, {}),
      ).rejects.toThrow('O carrinho está vazio.');
      expect(mockTx.pedido.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro se a loja não estiver definida no carrinho', async () => {
      // 1. Setup
      const mockCarrinhoSemLoja = { ...mockCarrinhoDB, lojaId: null };
      mockTx.carrinho.findUnique.mockResolvedValue(mockCarrinhoSemLoja);

      // 2. Execução e 3. Verificação
      await expect(
        pedidoServices.criarPedido(mockUsuarioLogado, {}),
      ).rejects.toThrow('Carrinho inválido ou loja não definida.');
      expect(mockTx.pedido.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro se um produto estiver indisponível', async () => {
      // 1. Setup
      mockTx.carrinho.findUnique.mockResolvedValue(mockCarrinhoDB);
      mockTx.produtosEmLoja.findFirst.mockResolvedValue(null); // Produto indisponível

      // 2. Execução e 3. Verificação
      await expect(
        pedidoServices.criarPedido(mockUsuarioLogado, {}),
      ).rejects.toThrow(
        `O produto "${mockCarrinhoDB.itensNoCarrinho[0].produto.nome}" não está mais disponível nesta loja.`,
      );
      expect(mockTx.pedido.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro se um modificador estiver indisponível', async () => {
      // 1. Setup
      mockTx.carrinho.findUnique.mockResolvedValue(mockCarrinhoDB);
      mockTx.produtosEmLoja.findFirst.mockResolvedValue(mockProdutoEmLoja);
      mockTx.modificadorEmLoja.findFirst.mockResolvedValue(null); // Modificador indisponível

      // 2. Execução e 3. Verificação
      await expect(
        pedidoServices.criarPedido(mockUsuarioLogado, {}),
      ).rejects.toThrow(
        `A opção "${mockCarrinhoDB.itensNoCarrinho[0].modificadoresSelecionados[0].modificador.nome}" não está mais disponível.`,
      );
      expect(mockTx.pedido.create).not.toHaveBeenCalled();
    });

    it('deve chamar o cupomService e calcular o desconto se codCupom for fornecido', async () => {
      // 1. Setup
      mockTx.carrinho.findUnique.mockResolvedValue(mockCarrinhoDB);
      mockTx.produtosEmLoja.findFirst.mockResolvedValue(mockProdutoEmLoja);
      mockTx.modificadorEmLoja.findUnique.mockResolvedValue(mockModEmLoja);
      mockTx.pedido.create.mockResolvedValue(mockPedidoCriado);
      mockTx.itemPedido.create.mockResolvedValue(mockItemPedidoCriado);

      // Mock do cupom
      const mockCupomResultado = {
        valido: true,
        cupomId: 5,
        tipoDesconto: TipoDesconto.VALOR_FIXO,
        valorDesconto: 10.0,
      };
      cupomDescontoServices.validarEUsarCupom.mockResolvedValue(
        mockCupomResultado,
      );

      // 2. Execução
      const dadosInput = { codCupom: 'DEZREAIS' };
      await pedidoServices.criarPedido(mockUsuarioLogado, dadosInput);

      // 3. Verificação
      expect(cupomDescontoServices.validarEUsarCupom).toHaveBeenCalledWith(
        'DEZREAIS',
        mockTx,
        mockUsuarioLogado,
      );
      expect(mockTx.pedido.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            valorBase: new Prisma.Decimal(25.0), // 20 + 5
            valorCobrado: new Prisma.Decimal(15.0), // 25.00 - 10.00
            cupomUsadoId: 5,
          }),
        }),
      );
    });

    it('deve lançar o erro do cupomService se o cupom for inválido', async () => {
      // 1. Setup
      mockTx.carrinho.findUnique.mockResolvedValue(mockCarrinhoDB);
      mockTx.produtosEmLoja.findFirst.mockResolvedValue(mockProdutoEmLoja);
      mockTx.modificadorEmLoja.findUnique.mockResolvedValue(mockModEmLoja);

      cupomDescontoServices.validarEUsarCupom.mockRejectedValue(
        new Error('Cupom expirado.'),
      );

      // 2. Execução e 3. Verificação
      const dadosInput = { codCupom: 'EXPIRADO' };
      await expect(
        pedidoServices.criarPedido(mockUsuarioLogado, dadosInput),
      ).rejects.toThrow('Cupom expirado.');
      expect(mockTx.pedido.create).not.toHaveBeenCalled();
    });
  });

  // --- Testando atualizarStatusDoPedido ---
  describe('atualizarStatusDoPedido', () => {
    // 1. Array de "objetos como parâmetro" para TRANSIÇÕES INVÁLIDAS
    const transicoesInvalidas = [
      { de: StatusPedido.REALIZADO, para: StatusPedido.PENDENTE },
      { de: StatusPedido.CANCELADO, para: StatusPedido.EM_PREPARO },
      { de: StatusPedido.EM_ENTREGA, para: StatusPedido.PENDENTE },
      { de: StatusPedido.PRONTO_PARA_ENTREGA, para: StatusPedido.PENDENTE },
      { de: StatusPedido.EM_PREPARO, para: StatusPedido.AGUARDANDO_PAGAMENTO },
    ];

    // 2. Bloco de teste único para transições inválidas
    test.each(transicoesInvalidas)(
      'deve lançar erro de transição inválida ao tentar mudar de $de para $para',
      async ({ de, para }) => {
        // 1. Setup
        const mockPedido = { id: 1, lojaId: 1, status: de };
        mockTx.pedido.findFirst.mockResolvedValue(mockPedido);

        // 2. Execução e 3. Verificação
        await expect(
          pedidoServices.atualizarStatusDoPedido(1, 1, para),
        ).rejects.toThrow(
          `Transição de status inválida: não é possível mudar de "${de}" para "${para}".`,
        );
        expect(mockTx.pedido.update).not.toHaveBeenCalled();
      },
    );

    it('deve lançar um erro se o status fornecido for inválido', async () => {
      // 1. Setup (não precisamos mockar o banco, pois deve falhar antes)
      const statusInvalido = 'STATUS_QUE_NAO_EXISTE';

      // 2. Execução e 3. Verificação
      // Testamos se a função LANÇA (rejects) um ERRO
      await expect(
        pedidoServices.atualizarStatusDoPedido(1, 1, statusInvalido),
      ).rejects.toThrow(`Status fornecido (${statusInvalido}) é inválido.`);

      // Garante que nenhuma operação de banco foi iniciada
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('deve lançar um erro se o pedido não for encontrado', async () => {
      // 1. Setup
      // Simula o findFirst (dentro do tx) retornando null
      mockTx.pedido.findFirst.mockResolvedValue(null);

      // 2. Execução e 3. Verificação
      await expect(
        pedidoServices.atualizarStatusDoPedido(99, 1, 'EM_PREPARO'),
      ).rejects.toThrow(
        'Pedido com ID 99 não encontrado ou não pertence à loja com ID 1.',
      );

      expect(mockTx.pedido.update).not.toHaveBeenCalled();
    });

    it('deve lançar um erro se a transição de status for inválida (ex: REALIZADO -> PENDENTE)', async () => {
      // 1. Setup
      const mockPedido = { id: 1, lojaId: 1, status: StatusPedido.REALIZADO }; // Pedido já realizado

      // Simula o findFirst (dentro do tx) retornando o pedido REALIZADO
      mockTx.pedido.findFirst.mockResolvedValue(mockPedido);

      // 2. Execução e 3. Verificação
      await expect(
        pedidoServices.atualizarStatusDoPedido(1, 1, 'PENDENTE'),
      ).rejects.toThrow(
        'Transição de status inválida: não é possível mudar de "REALIZADO" para "PENDENTE".',
      );

      expect(mockTx.pedido.update).not.toHaveBeenCalled();
    });

    it('deve apenas retornar o pedido se o status já for o desejado', async () => {
      // 1. Setup
      const mockPedido = { id: 1, lojaId: 1, status: StatusPedido.PENDENTE };
      mockTx.pedido.findFirst.mockResolvedValue(mockPedido);

      // 2. Execução (Tentando mudar PENDENTE -> PENDENTE)
      const resultado = await pedidoServices.atualizarStatusDoPedido(
        1,
        1,
        'PENDENTE',
      );

      // 3. Verificação
      expect(mockTx.pedido.findFirst).toHaveBeenCalledTimes(1);
      expect(mockTx.pedido.update).not.toHaveBeenCalled(); // NÃO deve chamar update
      expect(resultado).toEqual(mockPedido); // Retorna o pedido original
    });

    it('deve atualizar o RelatorioUsuario e gerar um cupom ao mudar para REALIZADO', async () => {
      // 1. Setup
      const mockPedido = {
        id: 1,
        lojaId: 1,
        status: StatusPedido.EM_ENTREGA, // Estado anterior
        clienteId: 'uuid-user-123',
        valorCobrado: new Prisma.Decimal(150.0), // Valor alto para atingir o limiar
      };

      const mockRelatorioAtualizado = {
        usuarioId: 'uuid-user-123',
        gastoDesdeUltimoCupom: new Prisma.Decimal(150.0), // Simula que atingiu o limiar
      };

      const mockPedidoRealizado = {
        ...mockPedido,
        status: StatusPedido.REALIZADO,
      };

      mockTx.pedido.findFirst.mockResolvedValue(mockPedido);
      mockTx.pedido.update.mockResolvedValue(mockPedidoRealizado); // Retorna o pedido atualizado
      mockTx.relatorioUsuario.update.mockResolvedValue(mockRelatorioAtualizado); // Retorna o relatório atualizado

      // Simula que o service de cupom foi chamado e funcionou
      cupomDescontoServices.criarCupomFidelidade.mockResolvedValue({
        id: 99,
        codCupom: 'FID-TESTE',
      });

      // 2. Execução
      await pedidoServices.atualizarStatusDoPedido(1, 1, 'REALIZADO');

      // 3. Verificação
      expect(mockTx.pedido.findFirst).toHaveBeenCalledTimes(1);
      // 1. Verifica se o status do PEDIDO foi atualizado
      expect(mockTx.pedido.update).toHaveBeenCalledTimes(1);

      // 2. Verifica se o RELATÓRIO foi atualizado 2x (incremento e depois reset)
      expect(mockTx.relatorioUsuario.update).toHaveBeenCalledTimes(2);

      // 3a. Verifica se o RelatorioUsuario foi incrementado CORRETAMENTE
      expect(mockTx.relatorioUsuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { usuarioId: 'uuid-user-123' },
          data: {
            gastosTotais: { increment: mockPedido.valorCobrado },
            gastosMensais: { increment: mockPedido.valorCobrado },
            qtdTotalPedidos: { increment: 1 },
            qtdMensalPedidos: { increment: 1 },
            gastoDesdeUltimoCupom: { increment: mockPedido.valorCobrado },
            dataUltimoPedido: expect.any(Date),
          },
        }),
      );

      // 3b. Verifica se o cupomService foi chamado (pois o limiar foi atingido)
      expect(cupomDescontoServices.criarCupomFidelidade).toHaveBeenCalledWith(
        mockTx,
        'uuid-user-123',
      );

      // 3c. Verifica se o contador 'gastoDesdeUltimoCupom' foi resetado (decrementado)
      expect(mockTx.relatorioUsuario.update).toHaveBeenLastCalledWith(
        expect.objectContaining({
          where: { usuarioId: 'uuid-user-123' },
          data: {
            gastoDesdeUltimoCupom: { decrement: new Prisma.Decimal(100.0) }, // Assumindo limiar de 100
          },
        }),
      );
    });
  });

  it('deve atualizar o RelatorioUsuario mas NÃO gerar cupom se o limiar não for atingido', async () => {
    // 1. Setup
    const mockPedido = {
      id: 1,
      lojaId: 1,
      status: StatusPedido.EM_ENTREGA,
      clienteId: 'uuid-user-123',
      valorCobrado: new Prisma.Decimal(50.0), // Valor baixo
    };

    const mockRelatorioAtualizado = {
      usuarioId: 'uuid-user-123',
      gastoDesdeUltimoCupom: new Prisma.Decimal(50.0), // Não atingiu o limiar de 100
    };

    const mockPedidoRealizado = {
      ...mockPedido,
      status: StatusPedido.REALIZADO,
    };

    mockTx.pedido.findFirst.mockResolvedValue(mockPedido);
    mockTx.pedido.update.mockResolvedValue(mockPedidoRealizado);
    mockTx.relatorioUsuario.update.mockResolvedValue(mockRelatorioAtualizado);

    // 2. Execução
    await pedidoServices.atualizarStatusDoPedido(1, 1, 'REALIZADO');

    // 3. Verificação
    expect(mockTx.relatorioUsuario.update).toHaveBeenCalledTimes(1); // Só 1 update (incremento)
    expect(cupomDescontoServices.criarCupomFidelidade).not.toHaveBeenCalled(); // NÃO deve chamar o cupom
  });

  it('NÃO deve atualizar o RelatorioUsuario se o status não for REALIZADO', async () => {
    // 1. Setup
    const mockPedido = { id: 1, lojaId: 1, status: StatusPedido.PENDENTE };
    const mockPedidoEmPreparo = {
      ...mockPedido,
      status: StatusPedido.EM_PREPARO,
    };

    mockTx.pedido.findFirst.mockResolvedValue(mockPedido);
    mockTx.pedido.update.mockResolvedValue(mockPedidoEmPreparo);

    // 2. Execução (PENDENTE -> EM_PREPARO)
    await pedidoServices.atualizarStatusDoPedido(1, 1, 'EM_PREPARO');

    // 3. Verificação
    expect(mockTx.pedido.update).toHaveBeenCalledTimes(1); // Só o update do pedido
    expect(mockTx.relatorioUsuario.update).not.toHaveBeenCalled(); // NÃO deve tocar no relatório
    expect(cupomDescontoServices.criarCupomFidelidade).not.toHaveBeenCalled();
  });

  // --- Testando cancelarMeuPedido (Versão Parametrizada) ---
  describe('cancelarMeuPedido', () => {
    // 1. O ARRAY DE "OBJETOS COMO PARÂMETRO"
    // Cada objeto é um cenário
    const casosDeCancelamento = [
      {
        status: StatusPedido.PENDENTE,
        deveCancelar: true,
        descricao: 'PENDENTE (válido)',
      },
      {
        status: StatusPedido.AGUARDANDO_PAGAMENTO,
        deveCancelar: true,
        descricao: 'AGUARDANDO_PAGAMENTO (válido)',
      },
      {
        status: StatusPedido.EM_PREPARO,
        deveCancelar: false,
        descricao: 'EM_PREPARO (inválido)',
      },
      {
        status: StatusPedido.PRONTO_PARA_ENTREGA,
        deveCancelar: false,
        descricao: 'PRONTO_PARA_ENTREGA (inválido)',
      },
      {
        status: StatusPedido.PRONTO_PARA_RETIRADA,
        deveCancelar: false,
        descricao: 'PRONTO_PARA_RETIRADA (inválido)',
      },
      {
        status: StatusPedido.EM_ENTREGA,
        deveCancelar: false,
        descricao: 'EM_ENTREGA (inválido)',
      },
      {
        status: StatusPedido.REALIZADO,
        deveCancelar: false,
        descricao: 'REALIZADO (inválido)',
      },
      {
        status: StatusPedido.CANCELADO,
        deveCancelar: false,
        descricao: 'CANCELADO (inválido)',
      },
    ];

    // 2. O BLOCO DE TESTE ÚNICO
    // test.each executa este 'it' uma vez para cada objeto no array 'casosDeCancelamento'
    test.each(casosDeCancelamento)(
      'deve lidar corretamente com um pedido no status: $descricao', // Nome dinâmico do teste
      // eslint-disable-next-line no-unused-vars
      async ({ status, deveCancelar, descricao }) => {
        // Desestrutura o objeto do cenário

        // 1. Setup (Usa os parâmetros)
        const mockPedido = { id: 1, clienteId: 'uuid-user-1', status };
        const mockPedidoCancelado = {
          ...mockPedido,
          status: StatusPedido.CANCELADO,
        };

        mockTx.pedido.findFirst.mockResolvedValue(mockPedido);
        mockTx.pedido.update.mockResolvedValue(mockPedidoCancelado);

        // 2. Execução (Usa os parâmetros)
        const promise = pedidoServices.cancelarMeuPedido(1, 'uuid-user-1');

        // 3. Verificação (Usa os parâmetros)
        if (deveCancelar) {
          // Se deveCancelar for true, esperamos que a promessa se resolva
          await expect(promise).resolves.toBeDefined();
          // E que o update tenha sido chamado para CANCELAR
          expect(mockTx.pedido.update).toHaveBeenCalledWith(
            expect.objectContaining({
              data: { status: StatusPedido.CANCELADO },
            }),
          );
        } else {
          // Se deveCancelar for false, esperamos que a promessa seja rejeitada
          await expect(promise).rejects.toThrow(
            `Este pedido (status: ${status}) não pode mais ser cancelado.`,
          );
          // E que o update NÃO tenha sido chamado
          expect(mockTx.pedido.update).not.toHaveBeenCalled();
        }
      },
    ); // Fim do test.each

    it('deve lançar um erro 404 se o pedido não for encontrado', async () => {
      // 1. Setup
      mockTx.pedido.findFirst.mockResolvedValue(null); // Pedido não encontrado

      // 2. Execução e 3. Verificação
      await expect(
        pedidoServices.cancelarMeuPedido(99, 'uuid-user-1'),
      ).rejects.toThrow(
        'Pedido com ID 99 não encontrado ou não pertence a este usuário.',
      );

      expect(mockTx.pedido.update).not.toHaveBeenCalled();
    });
  });
});
