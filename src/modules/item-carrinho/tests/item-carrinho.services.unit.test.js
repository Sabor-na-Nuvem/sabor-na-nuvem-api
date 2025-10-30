/* eslint-disable no-return-await */
/* eslint-disable import/first */
import { jest } from '@jest/globals';
// --- MOCKs ---

// 1. Mock do Prisma e da Transação
const mockTx = {
  carrinho: { findUnique: jest.fn(), upsert: jest.fn() },
  pedido: { findUnique: jest.fn() },
  produtosEmLoja: { findUnique: jest.fn() },
  modificador: { findUnique: jest.fn() },
  modificadorEmLoja: { findUnique: jest.fn() },
  itemCarrinho: { create: jest.fn() },
  itemCarrinhoModificadores: { createMany: jest.fn() },
};

// 2. Mock do Prisma Global (para funções fora de transação)
const mockPrisma = {
  $transaction: jest
    .fn()
    .mockImplementation(async (callback) => await callback(mockTx)),
  itemCarrinho: {
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

// 3. Mock do CarrinhoServices (dependência externa)
const mockCarrinhoServices = {
  buscarCarrinhoCompleto: jest.fn(),
};

// --- FIM DOS MOCKS ---

// 4. DECLARE AS VARIÁVEIS DOS MÓDULOS DINÂMICOS
let prisma;
let carrinhoServices;
let itemCarrinhoServices;

describe('ItemCarrinho Service', () => {
  beforeAll(async () => {
    // Mocka o módulo do Prisma
    jest.unstable_mockModule('../../../config/prisma.js', () => ({
      default: mockPrisma,
    }));

    // Mocka o módulo do CarrinhoServices
    jest.unstable_mockModule('../../carrinho/carrinho.services.js', () => ({
      default: mockCarrinhoServices,
    }));

    // Importa os módulos (mockados e o serviço a ser testado)
    prisma = mockPrisma;
    carrinhoServices = (await import('../../carrinho/carrinho.services.js'))
      .default;
    itemCarrinhoServices = (await import('../item-carrinho.services.js'))
      .default;
  });

  // Retorno padrão para o carrinhoServices
  const mockCarrinhoFinal = {
    id: 'uuid-user-1',
    subtotal: '10.00',
    itensNoCarrinho: [{}],
  };

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();

    // Reseta todos os mocks da transação
    Object.values(mockTx).forEach((table) =>
      Object.values(table).forEach((fn) => fn.mockReset()),
    );
    // Reseta todos os mocks do prisma global
    Object.values(prisma)
      .filter((val) => typeof val !== 'function')
      .forEach((table) => Object.values(table).forEach((fn) => fn.mockReset()));

    // Reconfigura a implementação da transação
    prisma.$transaction.mockImplementation(
      async (callback) => await callback(mockTx),
    );

    // Reconfigura o mock da dependência
    carrinhoServices.buscarCarrinhoCompleto.mockResolvedValue(
      mockCarrinhoFinal,
    );
  });

  const idUsuario = 'uuid-user-1';
  const idLoja = 1;

  // --- Mocks de Dados Padrão ---
  const mockProdutoEmLoja = {
    valorBase: 20.0,
    produto: {
      personalizacao: [
        { id: 10, nome: 'Tamanho', selecaoMinima: 1, selecaoMaxima: 1 },
      ],
    },
  };
  const mockModificador = { id: 101, personalizavelId: 10, nome: 'Médio' };
  const mockModificadorEmLoja = {
    disponivel: true,
    valorAdicional: 5.0,
  };
  const mockItemCriado = { id: 99 /* ... */ };

  // --- TESTES ---

  describe('adicionarItemAoCarrinho', () => {
    const dadosItem = {
      idProduto: 1,
      qtdProduto: 1,
      idLoja,
      modificadores: [{ modificadorId: 101 }],
    };

    beforeEach(() => {
      // Setup de sucesso padrão
      mockTx.carrinho.upsert.mockResolvedValue({ lojaId: idLoja });
      mockTx.produtosEmLoja.findUnique.mockResolvedValue(mockProdutoEmLoja);
      mockTx.modificador.findUnique.mockResolvedValue(mockModificador);
      mockTx.modificadorEmLoja.findUnique.mockResolvedValue(
        mockModificadorEmLoja,
      );
      mockTx.itemCarrinho.create.mockResolvedValue(mockItemCriado);
    });

    it('deve adicionar um item com sucesso', async () => {
      const resultado = await itemCarrinhoServices.adicionarItemAoCarrinho(
        idUsuario,
        dadosItem,
      );

      expect(mockTx.carrinho.upsert).toHaveBeenCalled();
      expect(mockTx.produtosEmLoja.findUnique).toHaveBeenCalled();
      expect(mockTx.modificador.findUnique).toHaveBeenCalled();
      expect(mockTx.modificadorEmLoja.findUnique).toHaveBeenCalled();
      expect(mockTx.itemCarrinho.create).toHaveBeenCalled();
      expect(mockTx.itemCarrinhoModificadores.createMany).toHaveBeenCalled();
      expect(carrinhoServices.buscarCarrinhoCompleto).toHaveBeenCalledWith(
        idUsuario,
      );
      expect(resultado).toBe(mockCarrinhoFinal);
    });

    it('deve lançar erro se lojaId não for fornecido', async () => {
      await expect(
        itemCarrinhoServices.adicionarItemAoCarrinho(idUsuario, {
          idProduto: 1,
        }),
      ).rejects.toThrow('A loja (lojaId) é obrigatória ao adicionar um item.');
    });

    it('deve lançar erro se o item for de uma loja diferente do carrinho', async () => {
      mockTx.carrinho.upsert.mockResolvedValue({ lojaId: 2 }); // Carrinho é da loja 2

      await expect(
        itemCarrinhoServices.adicionarItemAoCarrinho(idUsuario, dadosItem), // Item é da loja 1
      ).rejects.toThrow(
        'Este item é da Loja 1, mas seu carrinho já contém itens da Loja 2. Limpe o carrinho para trocar de loja.',
      );
    });

    it('deve lançar erro se o produto estiver indisponível', async () => {
      mockTx.produtosEmLoja.findUnique.mockResolvedValue(null);
      await expect(
        itemCarrinhoServices.adicionarItemAoCarrinho(idUsuario, dadosItem),
      ).rejects.toThrow('Produto não encontrado ou indisponível nesta loja.');
    });

    it('deve lançar erro se o modificador estiver indisponível', async () => {
      mockTx.modificadorEmLoja.findUnique.mockResolvedValue(null);
      await expect(
        itemCarrinhoServices.adicionarItemAoCarrinho(idUsuario, dadosItem),
      ).rejects.toThrow(
        'Opção "Médio" (ID: 101) está indisponível nesta loja.',
      );
    });

    it('deve lançar erro se a regra de seleção mínima não for atendida', async () => {
      // O grupo 'Tamanho' exige 1, mas o input não envia nenhum.
      const dadosSemMod = { ...dadosItem, modificadores: [] };
      await expect(
        itemCarrinhoServices.adicionarItemAoCarrinho(idUsuario, dadosSemMod),
      ).rejects.toThrow(
        'Seleção obrigatória faltante: O grupo "Tamanho" exige no mínimo 1 opção(ões).',
      );
    });
  });

  describe('adicionarItensDoPedido', () => {
    const idPedido = 1;
    const mockItemAntigo = {
      produtoId: 1,
      qtdProduto: 2,
      produto: { nome: 'X-Burger' },
      modificadoresSelecionados: [{ modificadorId: 101 }],
    };
    const mockPedidoAntigo = {
      id: idPedido,
      clienteId: idUsuario,
      itensNoPedido: [mockItemAntigo],
    };

    beforeEach(() => {
      // Setup de sucesso padrão
      mockTx.carrinho.findUnique.mockResolvedValue({ lojaId: idLoja });
      mockTx.pedido.findUnique.mockResolvedValue(mockPedidoAntigo);
      mockTx.produtosEmLoja.findUnique.mockResolvedValue(mockProdutoEmLoja);
      mockTx.modificador.findUnique.mockResolvedValue(mockModificador);
      mockTx.modificadorEmLoja.findUnique.mockResolvedValue(
        mockModificadorEmLoja,
      );
      mockTx.itemCarrinho.create.mockResolvedValue(mockItemCriado);
    });

    it('deve adicionar itens de um pedido com sucesso', async () => {
      const resultado = await itemCarrinhoServices.adicionarItensDoPedido(
        idUsuario,
        idPedido,
      );

      expect(mockTx.carrinho.findUnique).toHaveBeenCalled();
      expect(mockTx.pedido.findUnique).toHaveBeenCalled();
      expect(mockTx.produtosEmLoja.findUnique).toHaveBeenCalled(); // Validou o item
      expect(mockTx.itemCarrinho.create).toHaveBeenCalled(); // Criou o item
      expect(resultado.avisos).toHaveLength(0); // Sem avisos
      expect(resultado.carrinho).toBe(mockCarrinhoFinal);
      expect(carrinhoServices.buscarCarrinhoCompleto).toHaveBeenCalled();
    });

    it('deve pular item inválido e retornar um aviso', async () => {
      mockTx.produtosEmLoja.findUnique.mockResolvedValue(null); // Produto indisponível

      const resultado = await itemCarrinhoServices.adicionarItensDoPedido(
        idUsuario,
        idPedido,
      );

      expect(mockTx.itemCarrinho.create).not.toHaveBeenCalled(); // Não criou o item
      expect(resultado.avisos).toHaveLength(1); // Deve ter um aviso
      expect(resultado.avisos[0]).toContain(
        "Não foi possível adicionar 'X-Burger'",
      );
      expect(resultado.avisos[0]).toContain('indisponível');
      expect(resultado.carrinho).toBe(mockCarrinhoFinal);
    });

    it('deve lançar erro se o carrinho não tiver loja', async () => {
      mockTx.carrinho.findUnique.mockResolvedValue(null);
      await expect(
        itemCarrinhoServices.adicionarItensDoPedido(idUsuario, idPedido),
      ).rejects.toThrow('Loja não definida no carrinho.');
    });

    it('deve lançar erro se o pedido não for encontrado', async () => {
      mockTx.pedido.findUnique.mockResolvedValue(null);
      await expect(
        itemCarrinhoServices.adicionarItensDoPedido(idUsuario, idPedido),
      ).rejects.toThrow('Pedido com ID 1 não encontrado');
    });
  });

  describe('atualizarItemNoCarrinho', () => {
    // Nota: Esta função usa o prisma global (mockPrisma)
    const idItem = 1;
    const dadosUpdate = { qtdProduto: 5 };

    it('deve atualizar a quantidade do item com sucesso', async () => {
      prisma.itemCarrinho.findFirst.mockResolvedValue({ id: idItem });
      prisma.itemCarrinho.update.mockResolvedValue({
        id: idItem,
        ...dadosUpdate,
      });

      const resultado = await itemCarrinhoServices.atualizarItemNoCarrinho(
        idUsuario,
        idItem,
        dadosUpdate,
      );

      expect(prisma.itemCarrinho.findFirst).toHaveBeenCalled();
      expect(prisma.itemCarrinho.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: idItem },
          data: { qtdProduto: 5 },
        }),
      );
      expect(carrinhoServices.buscarCarrinhoCompleto).toHaveBeenCalled();
      expect(resultado).toBe(mockCarrinhoFinal);
    });

    it('deve lançar erro se o item não for encontrado', async () => {
      prisma.itemCarrinho.findFirst.mockResolvedValue(null);

      await expect(
        itemCarrinhoServices.atualizarItemNoCarrinho(
          idUsuario,
          idItem,
          dadosUpdate,
        ),
      ).rejects.toThrow(
        'Item (ID: 1) não encontrado no carrinho deste usuário.',
      );
      expect(prisma.itemCarrinho.update).not.toHaveBeenCalled();
    });
  });

  describe('removerItemDoCarrinho', () => {
    // Nota: Esta função usa o prisma global (mockPrisma)
    const idItem = 1;

    it('deve remover o item com sucesso', async () => {
      prisma.itemCarrinho.findFirst.mockResolvedValue({ id: idItem });
      prisma.itemCarrinho.delete.mockResolvedValue({ id: idItem });

      const resultado = await itemCarrinhoServices.removerItemDoCarrinho(
        idUsuario,
        idItem,
      );

      expect(prisma.itemCarrinho.findFirst).toHaveBeenCalled();
      expect(prisma.itemCarrinho.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: idItem } }),
      );
      expect(carrinhoServices.buscarCarrinhoCompleto).toHaveBeenCalled();
      expect(resultado).toBe(mockCarrinhoFinal);
    });

    it('deve lançar erro se o item não for encontrado', async () => {
      prisma.itemCarrinho.findFirst.mockResolvedValue(null);

      await expect(
        itemCarrinhoServices.removerItemDoCarrinho(idUsuario, idItem),
      ).rejects.toThrow(
        'Item (ID: 1) não encontrado no carrinho deste usuário.',
      );
      expect(prisma.itemCarrinho.delete).not.toHaveBeenCalled();
    });
  });
});
