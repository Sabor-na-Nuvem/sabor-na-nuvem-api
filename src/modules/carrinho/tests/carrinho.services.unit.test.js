/* eslint-disable no-return-await */
/* eslint-disable import/first */
import { jest } from '@jest/globals';
import { Prisma, TipoPedido } from '@prisma/client';

// --- MOCKs ---
// 1. Mock do Prisma e da Transação
// O mockTx simula as chamadas DENTRO de uma transação ($transaction)
const mockTx = {
  carrinho: { findUnique: jest.fn(), upsert: jest.fn() },
  itemCarrinho: { update: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
  itemCarrinhoModificadores: {
    update: jest.fn(),
    deleteMany: jest.fn(),
    create: jest.fn(),
  },
  produtosEmLoja: { findUnique: jest.fn() },
  modificadorEmLoja: { findUnique: jest.fn() },
};

// O mockPrisma simula as chamadas FORA de uma transação
// (usado por limparCarrinho)
const mockPrisma = {
  $transaction: jest
    .fn()
    .mockImplementation(async (callback) => await callback(mockTx)),
  carrinho: { findUnique: jest.fn() },
  itemCarrinho: { deleteMany: jest.fn() },
};
// --- FIM DOS MOCKS ---

// 3. DECLARE AS VARIÁVEIS DOS MÓDULOS DINÂMICOS
let prisma;
let carrinhoServices;

describe('Carrinho Service', () => {
  beforeAll(async () => {
    // 1. Mocka o módulo do Prisma
    jest.unstable_mockModule('../../../config/prisma.js', () => ({
      default: mockPrisma,
    }));

    // 2. Atribui a variável local
    prisma = mockPrisma;

    // 3. Importa o serviço (que agora recebe o prisma mockado)
    carrinhoServices = (await import('../carrinho.services.js')).default;
  });

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();

    // Reseta todos os mocks da transação
    Object.values(mockTx).forEach((table) =>
      Object.values(table).forEach((fn) => fn.mockReset()),
    );
    // Reseta todos os mocks do prisma global
    Object.values(mockPrisma)
      .filter((val) => typeof val !== 'function') // Filtra o $transaction em si
      .forEach((table) => Object.values(table).forEach((fn) => fn.mockReset()));

    // Reconfigura a implementação da transação
    prisma.$transaction.mockImplementation(
      async (callback) => await callback(mockTx),
    );
  });

  // --- TESTES ---

  describe('buscarCarrinhoCompleto', () => {
    // Nota: Este serviço usa 'txClient = prisma' como padrão,
    // então mockamos o 'mockPrisma', não o 'mockTx'.
    it('deve retornar null se o carrinho não for encontrado', async () => {
      prisma.carrinho.findUnique.mockResolvedValue(null);

      await expect(
        carrinhoServices.buscarCarrinhoCompleto('uuid-user-1'),
      ).resolves.toBeNull();
      expect(prisma.carrinho.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'uuid-user-1' } }),
      );
    });

    it('deve retornar subtotal 0.00 para um carrinho vazio', async () => {
      const mockCarrinhoVazio = {
        id: 'uuid-user-1',
        lojaId: 1,
        tipo: 'ENTREGA',
        loja: { id: 1, nome: 'Loja Teste' },
        itensNoCarrinho: [],
      };
      prisma.carrinho.findUnique.mockResolvedValue(mockCarrinhoVazio);

      const resultado =
        await carrinhoServices.buscarCarrinhoCompleto('uuid-user-1');

      expect(resultado).toHaveProperty('subtotal', '0.00');
      expect(resultado.itensNoCarrinho).toHaveLength(0);
    });

    it('deve calcular o subtotal corretamente (sem modificadores)', async () => {
      const mockCarrinho = {
        id: 'uuid-user-1',
        itensNoCarrinho: [
          {
            valorUnitarioProduto: new Prisma.Decimal(10.0),
            qtdProduto: 2,
            modificadoresSelecionados: [],
          }, // 10 * 2 = 20
        ],
      };
      prisma.carrinho.findUnique.mockResolvedValue(mockCarrinho);

      const resultado =
        await carrinhoServices.buscarCarrinhoCompleto('uuid-user-1');
      expect(resultado).toHaveProperty('subtotal', '20.00');
    });

    it('deve calcular o subtotal corretamente (com modificadores)', async () => {
      const mockCarrinho = {
        id: 'uuid-user-1',
        itensNoCarrinho: [
          {
            // Item 1: (10.00 + 2.50 + 1.00) * 1 = 13.50
            valorUnitarioProduto: new Prisma.Decimal(10.0),
            qtdProduto: 1,
            modificadoresSelecionados: [
              { valorAdicionalCobrado: new Prisma.Decimal(2.5) },
              { valorAdicionalCobrado: new Prisma.Decimal(1.0) },
            ],
          },
          {
            // Item 2: (20.00) * 2 = 40.00
            valorUnitarioProduto: new Prisma.Decimal(20.0),
            qtdProduto: 2,
            modificadoresSelecionados: [],
          },
        ],
      };
      prisma.carrinho.findUnique.mockResolvedValue(mockCarrinho);

      const resultado =
        await carrinhoServices.buscarCarrinhoCompleto('uuid-user-1');
      // Total = 13.50 + 40.00 = 53.50
      expect(resultado).toHaveProperty('subtotal', '53.50');
    });
  });

  describe('atualizarCarrinho', () => {
    const idUsuario = 'uuid-user-1';
    // Mock do carrinho final que 'buscarCarrinhoCompleto' retorna
    const mockCarrinhoFinal = {
      id: idUsuario,
      subtotal: '10.00',
      itensNoCarrinho: [
        /* ... */
      ],
    };

    beforeEach(() => {
      // CRIA o spy ANTES de cada teste neste 'describe'
      jest
        .spyOn(carrinhoServices, 'buscarCarrinhoCompleto')
        .mockResolvedValue(mockCarrinhoFinal);
    });

    afterEach(() => {
      // RESTAURA o spy DEPOIS de cada teste
      // Isso garante que ele não vaze para outros 'describes'
      carrinhoServices.buscarCarrinhoCompleto.mockRestore();
    });

    it('deve criar um carrinho novo se não existir (com lojaId)', async () => {
      mockTx.carrinho.findUnique.mockResolvedValue(null); // Carrinho não existe

      const novosDados = { lojaId: 1, tipo: 'ENTREGA' };
      await carrinhoServices.atualizarCarrinho(idUsuario, novosDados);

      expect(mockTx.carrinho.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: idUsuario },
          create: {
            id: idUsuario,
            lojaId: 1,
            tipo: TipoPedido.ENTREGA,
          },
        }),
      );
    });

    it('deve lançar erro ao tentar criar um carrinho sem lojaId', async () => {
      mockTx.carrinho.findUnique.mockResolvedValue(null); // Carrinho não existe

      const novosDados = { tipo: 'ENTREGA' };
      await expect(
        carrinhoServices.atualizarCarrinho(idUsuario, novosDados),
      ).rejects.toThrow(
        'Loja (lojaId) é obrigatória ao criar um carrinho ou adicionar o primeiro item.',
      );
    });

    it('deve apenas atualizar o tipo do carrinho se não houver mudança de loja', async () => {
      const mockCarrinhoExistente = {
        id: idUsuario,
        lojaId: 1,
        itensNoCarrinho: [],
      };
      mockTx.carrinho.findUnique.mockResolvedValue(mockCarrinhoExistente);

      const novosDados = { tipo: 'RETIRADA' };
      await carrinhoServices.atualizarCarrinho(idUsuario, novosDados);

      expect(mockTx.carrinho.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: idUsuario },
          update: {
            tipo: TipoPedido.RETIRADA,
          },
        }),
      );
      // Garante que a lógica de revalidação não foi executada
      expect(mockTx.produtosEmLoja.findUnique).not.toHaveBeenCalled();
      expect(mockTx.itemCarrinho.delete).not.toHaveBeenCalled();
    });

    describe('mudança de loja', () => {
      // Mock de dados complexos para os testes de mudança de loja
      const mockProdutoValido = {
        id: 101,
        nome: 'X-Burger',
        personalizacao: [
          // Grupo Obrigatório (Ex: Pão)
          {
            id: 201,
            selecaoMinima: 1,
            modificadores: [
              { id: 301, isOpcaoPadrao: true, nome: 'Pão Brioche' }, // Padrão
              { id: 302, isOpcaoPadrao: false, nome: 'Pão Australiano' },
            ],
          },
        ],
      };
      const mockCarrinhoComItens = {
        id: idUsuario,
        lojaId: 1, // Loja Antiga
        itensNoCarrinho: [
          {
            id: 1, // itemCarrinhoId
            produtoId: 101,
            produto: mockProdutoValido,
            modificadoresSelecionados: [
              {
                // Modificador que será invalidado (Pão Australiano)
                itemCarrinhoId: 1,
                modificadorId: 302,
                modificador: {
                  id: 302,
                  personalizavelId: 201,
                  nome: 'Pão Australiano',
                },
              },
            ],
          },
          {
            id: 2, // itemCarrinhoId
            produtoId: 102,
            produto: { id: 102, nome: 'Batata Frita', personalizacao: [] },
            modificadoresSelecionados: [],
          },
        ],
      };
      const novaLojaId = 2;
      const novosDados = { lojaId: novaLojaId };

      it('deve remover item inválido na nova loja e adicionar aviso', async () => {
        mockTx.carrinho.findUnique.mockResolvedValue(mockCarrinhoComItens);

        // Mock Item 1 (X-Burger) - VÁLIDO
        mockTx.produtosEmLoja.findUnique.mockResolvedValueOnce({
          lojaId: novaLojaId,
          produtoId: 101,
          disponivel: true,
          valorBase: 25.0,
        });
        // Mock Item 2 (Batata) - INVÁLIDO
        mockTx.produtosEmLoja.findUnique.mockResolvedValueOnce(null);

        // (A lógica de modificador do item 1 será executada, mockamos como válida)
        mockTx.modificadorEmLoja.findUnique.mockResolvedValue({
          lojaId: novaLojaId,
          modificadorId: 302,
          disponivel: true,
          valorAdicional: 2.0,
        });

        const resultado = await carrinhoServices.atualizarCarrinho(
          idUsuario,
          novosDados,
        );

        // Verifica se o Item 2 (Batata) foi deletado
        expect(mockTx.itemCarrinho.delete).toHaveBeenCalledWith({
          where: { id: 2 },
        });
        // Verifica se o Item 1 (X-Burger) NÃO foi deletado
        expect(mockTx.itemCarrinho.delete).toHaveBeenCalledTimes(1);
        // Verifica o aviso
        expect(resultado.avisos).toContain(
          "Item 'Batata Frita' foi removido (indisponível na nova loja).",
        );
      });

      it('deve remover modificador inválido e adicionar aviso', async () => {
        mockTx.carrinho.findUnique.mockResolvedValue(mockCarrinhoComItens);

        // Mock Item 1 (X-Burger) - VÁLIDO
        const mockProdutoEmLojaValido = { disponivel: true, valorBase: 20.0 };
        mockTx.produtosEmLoja.findUnique.mockResolvedValue(
          mockProdutoEmLojaValido,
        );

        // Mock Modificador (Pão Australiano) - INVÁLIDO
        mockTx.modificadorEmLoja.findUnique.mockResolvedValueOnce(null);

        const resultado = await carrinhoServices.atualizarCarrinho(
          idUsuario,
          novosDados,
        );

        // Verifica se o modificador foi deletado
        expect(
          mockTx.itemCarrinhoModificadores.deleteMany,
        ).toHaveBeenCalledWith({
          where: { OR: [{ itemCarrinhoId: 1, modificadorId: 302 }] },
        });
        // Verifica o aviso
        expect(resultado.avisos).toContain(
          "Opção 'Pão Australiano' foi removida do item 'X-Burger' (indisponível na nova loja).",
        );
      });

      it('deve adicionar mod padrão se grupo obrigatório for quebrado', async () => {
        mockTx.carrinho.findUnique.mockResolvedValue(mockCarrinhoComItens);

        const mockProdutoEmLojaValido = { disponivel: true, valorBase: 20.0 };
        mockTx.produtosEmLoja.findUnique.mockResolvedValue(
          mockProdutoEmLojaValido,
        );

        // Mock Modificador (Pão Australiano) - INVÁLIDO (será removido)
        mockTx.modificadorEmLoja.findUnique.mockResolvedValueOnce(null);

        // Mock Modificador Padrão (Pão Brioche) - VÁLIDO (será adicionado)
        mockTx.modificadorEmLoja.findUnique.mockResolvedValueOnce({
          lojaId: novaLojaId,
          modificadorId: 301,
          disponivel: true,
          valorAdicional: 0.0,
        });

        const resultado = await carrinhoServices.atualizarCarrinho(
          idUsuario,
          novosDados,
        );

        // 1. Modificador antigo foi removido
        expect(
          mockTx.itemCarrinhoModificadores.deleteMany,
        ).toHaveBeenCalledTimes(1);
        // 2. Modificador padrão foi ADICIONADO
        expect(mockTx.itemCarrinhoModificadores.create).toHaveBeenCalledWith({
          data: {
            itemCarrinhoId: 1,
            modificadorId: 301,
            valorAdicionalCobrado: 0.0,
          },
        });
        // 3. O item NÃO foi deletado
        expect(mockTx.itemCarrinho.delete).not.toHaveBeenCalled();
        // 4. Aviso correto
        expect(resultado.avisos).toContain(
          "Opção do item 'X-Burger' foi alterada para 'Pão Brioche' (opção padrão).",
        );
      });

      it('deve remover o ITEM se grupo obrigatório for quebrado e padrão falhar', async () => {
        mockTx.carrinho.findUnique.mockResolvedValue(mockCarrinhoComItens);

        // Simula o retorno de 'tx.produtosEmLoja.findUnique'
        const mockProdutoEmLojaValido = { disponivel: true, valorBase: 20.0 };
        mockTx.produtosEmLoja.findUnique.mockResolvedValue(
          mockProdutoEmLojaValido,
        );

        // Mock Modificador (Pão Australiano) - INVÁLIDO (será removido)
        mockTx.modificadorEmLoja.findUnique.mockResolvedValueOnce(null);

        // Mock Modificador Padrão (Pão Brioche) - INVÁLIDO (padrão indisponível)
        mockTx.modificadorEmLoja.findUnique.mockResolvedValueOnce(null);

        const resultado = await carrinhoServices.atualizarCarrinho(
          idUsuario,
          novosDados,
        );

        // 1. Modificador antigo foi removido
        expect(
          mockTx.itemCarrinhoModificadores.deleteMany,
        ).toHaveBeenCalledTimes(1);
        // 2. Modificador padrão NÃO foi adicionado
        expect(mockTx.itemCarrinhoModificadores.create).not.toHaveBeenCalled();
        // 3. O ITEM 1 (X-Burger) foi deletado
        expect(mockTx.itemCarrinho.delete).toHaveBeenCalledWith({
          where: { id: 1 },
        });
        // 4. Aviso correto
        expect(resultado.avisos).toContain(
          "Item 'X-Burger' foi removido (opção obrigatória indisponível na nova loja).",
        );
      });
    });
  });

  describe('limparCarrinho', () => {
    // Nota: Este serviço usa o 'prisma' global, não o 'mockTx'.
    const idUsuario = 'uuid-user-1';

    it('deve lançar erro se o carrinho não for encontrado', async () => {
      prisma.carrinho.findUnique.mockResolvedValue(null);

      await expect(carrinhoServices.limparCarrinho(idUsuario)).rejects.toThrow(
        `Carrinho não encontrado para o usuário ${idUsuario}.`,
      );
    });

    it('deve chamar deleteMany nos itens do carrinho se o carrinho existir', async () => {
      prisma.carrinho.findUnique.mockResolvedValue({ id: idUsuario });
      prisma.itemCarrinho.deleteMany.mockResolvedValue({ count: 3 });

      await carrinhoServices.limparCarrinho(idUsuario);

      expect(prisma.carrinho.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: idUsuario } }),
      );
      expect(prisma.itemCarrinho.deleteMany).toHaveBeenCalledWith({
        where: { carrinhoId: idUsuario },
      });
    });
  });
});
