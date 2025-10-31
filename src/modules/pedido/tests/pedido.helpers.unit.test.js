import { jest } from '@jest/globals';
import { Prisma, StatusPedido, TipoPedido } from '@prisma/client';
import {
  calcularDesconto,
  buscarPedidoDetalhado,
  listarPedidos,
  includeDetalhesPedido,
} from '../pedido.helpers.js';

// Mock do cliente Prisma (txClient)
const mockTxClient = {
  $transaction: jest.fn(),
  pedido: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

describe('Pedido Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reseta a implementação padrão do $transaction
    // eslint-disable-next-line no-unused-vars
    mockTxClient.$transaction.mockImplementation(async (_consultas) => {
      // Simula uma resposta padrão de lista
      return [[{ id: 1 }], 1];
    });
  });

  // --- Teste para calcularDesconto (Parametrizado) ---
  describe('calcularDesconto', () => {
    // 1. Array de "objetos como parâmetro"
    const casosDeTeste = [
      {
        desc: 'PERCENTUAL',
        base: '100.00',
        tipo: 'PERCENTUAL',
        valor: 10,
        esperado: '90.00',
      },
      {
        desc: 'VALOR_FIXO',
        base: '50.00',
        tipo: 'VALOR_FIXO',
        valor: 15.5,
        esperado: '34.50',
      },
      {
        desc: 'VALOR_FIXO (não negativo)',
        base: '10.00',
        tipo: 'VALOR_FIXO',
        valor: 15.0,
        esperado: '0.00',
      },
      {
        desc: 'Tipo inválido',
        base: '100.00',
        tipo: 'TIPO_INVALIDO',
        valor: 20,
        esperado: '100.00',
      },
      {
        desc: '0% de desconto',
        base: '120.00',
        tipo: 'PERCENTUAL',
        valor: 0,
        esperado: '120.00',
      },
    ];

    // 2. Bloco de teste único
    test.each(casosDeTeste)(
      'deve calcular corretamente para $desc',
      // CORREÇÃO 3: Desestruturar o objeto
      ({ base, tipo, valor, esperado }) => {
        const valorBaseDecimal = new Prisma.Decimal(base);
        const valorEsperadoDecimal = new Prisma.Decimal(esperado);

        const resultado = calcularDesconto(
          // <-- Mudei o nome
          valorBaseDecimal,
          tipo,
          Number(valor),
        );

        // A função calcularDesconto retorna um Decimal
        const resultadoDecimal = new Prisma.Decimal(resultado);
        expect(resultadoDecimal.equals(valorEsperadoDecimal)).toBe(true);
      },
    );
  });

  // --- Teste para buscarPedidoDetalhado (Não parametrizado, só 1 caso) ---
  describe('buscarPedidoDetalhado', () => {
    it('deve chamar prisma.pedido.findFirst com o whereClause e include corretos', async () => {
      const whereClause = { id: 1, clienteId: 'uuid-user-1' };
      mockTxClient.pedido.findFirst.mockResolvedValue({ id: 1 }); // Mock simples

      await buscarPedidoDetalhado(whereClause, mockTxClient);

      expect(mockTxClient.pedido.findFirst).toHaveBeenCalledWith({
        where: whereClause,
        include: includeDetalhesPedido, // Verifica se usou a constante
      });
    });
  });

  // --- Teste para listarPedidos (Parametrizado) ---
  describe('listarPedidos', () => {
    const whereBase = { lojaId: 1 };
    const includeBase = { cliente: true };

    // 1. Array de "objetos como parâmetro" para os filtros
    const casosDeFiltro = [
      {
        nome: 'sem filtros (apenas base)',
        filtros: {},
        whereEsperado: { lojaId: 1 },
      },
      {
        nome: 'com filtro de status válido (PENDENTE)',
        filtros: { status: 'PENDENTE' },
        whereEsperado: { lojaId: 1, status: StatusPedido.PENDENTE },
      },
      {
        nome: 'com filtro de tipo válido (ENTREGA)',
        filtros: { tipo: 'ENTREGA' },
        whereEsperado: { lojaId: 1, tipo: TipoPedido.ENTREGA },
      },
      {
        nome: 'com filtro de status inválido (ignora)',
        filtros: { status: 'INVALIDO' },
        whereEsperado: { lojaId: 1 },
      },
      {
        nome: 'com filtro de data (dataDe e dataAte)',
        filtros: { dataDe: '2025-01-01', dataAte: '2025-01-31' },
        whereEsperado: {
          lojaId: 1,
          dataHora: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-01-31'),
          },
        },
      },
      {
        nome: 'com filtro de clienteId (string uuid)',
        filtros: { clienteId: 'uuid-cliente-teste' },
        whereEsperado: { lojaId: 1, clienteId: 'uuid-cliente-teste' },
      },
    ];

    // 2. Bloco de teste único
    test.each(casosDeFiltro)(
      'deve construir o whereClause corretamente $nome',
      async ({ filtros, whereBase: baseOverride, whereEsperado }) => {
        const base = baseOverride || whereBase; // Usa a base do caso ou a padrão

        await listarPedidos(base, filtros, includeBase, mockTxClient);

        // Verifica se a transação foi chamada
        expect(mockTxClient.$transaction).toHaveBeenCalledTimes(1);

        // Verifica se o 'count' (que está dentro da transação)
        // foi chamado com o 'where' esperado
        expect(mockTxClient.pedido.count).toHaveBeenCalledWith({
          where: whereEsperado,
        });

        // Verifica se o 'findMany' foi chamado com o 'where' esperado
        expect(mockTxClient.pedido.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: whereEsperado,
            include: includeBase,
            orderBy: { createdAt: 'desc' },
            take: 10,
            skip: 0,
          }),
        );
      },
    );
  });
});
