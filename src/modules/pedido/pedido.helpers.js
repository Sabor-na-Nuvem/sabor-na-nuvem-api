import { Prisma, StatusPedido, TipoPedido } from '@prisma/client';
import prisma from '../../config/prisma.js';

// --- DEFINIÇÕES REUTILIZÁVEIS ---

/**
 * Calcula o desconto de uma promoção ou de um cupom aplicado ao pedido.
 * Usado por criarPedido.
 */
export function calcularDesconto(valorBase, tipoDesconto, valorDesconto) {
  if (tipoDesconto === 'PERCENTUAL') {
    // Assume que valorDesconto é ex: 10 para 10%
    const desconto = valorBase.times(valorDesconto).dividedBy(100);
    return valorBase.minus(desconto);
  }
  if (tipoDesconto === 'VALOR_FIXO') {
    // Assume que valorDesconto é ex: 15.50
    const resultado = valorBase.minus(valorDesconto);
    return resultado.isNegative() ? new Prisma.Decimal(0) : resultado;
  }
  return valorBase;
}

/**
 * Define a estrutura de 'include' profunda para buscar os detalhes de um Pedido.
 * Reutilizado por buscarMeuPedidoPorId, buscarPedidoDaLoja, e buscarPedidoPorIdAdmin.
 */
export const includeDetalhesPedido = {
  cupom: { select: { codCupom: true } },
  loja: { select: { nome: true } },
  cliente: { select: { nome: true } },
  itensNoPedido: {
    include: {
      produto: {
        select: {
          nome: true,
          imagemUrl: true,
          categoria: { select: { nome: true } },
          personalizacao: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      },
      modificadoresSelecionados: {
        include: {
          modificador: {
            select: {
              personalizavelId: true,
              nome: true,
              ordemVisualizacao: true,
            },
          },
        },
      },
    },
  },
};

/**
 * Função "privada" (helper) que busca um pedido detalhado por uma cláusula 'where'
 */
export async function buscarPedidoDetalhado(whereClause, txClient = prisma) {
  return txClient.pedido.findFirst({
    where: whereClause,
    include: includeDetalhesPedido,
  });
}

/**
 * Função "privada" (helper) que lista e pagina pedidos com base em filtros e uma condição base
 * Reutilizado por listarMeusPedidos, listarPedidosDaLoja, e listarTodosOsPedidos.
 */
export async function listarPedidos(
  whereBase,
  filtros,
  include = {},
  txClient = prisma,
) {
  // Configuração da Paginação
  const page = Number(filtros.page) || 0;
  const limit = Number(filtros.limit) || 10;
  const skip = page * limit;

  // Configuração da Ordenação
  const sortBy = filtros.sortBy || 'createdAt';
  const order = filtros.order || 'desc';
  const orderBy = { [sortBy]: order };

  // Construção da Cláusula 'where'
  const whereClause = { ...whereBase };

  // Filtro: Status
  if (filtros.status && typeof filtros.status === 'string') {
    const statusFormatado = filtros.status.toUpperCase();
    if (statusFormatado in StatusPedido) {
      whereClause.status = StatusPedido[statusFormatado];
    }
  }
  // Filtro: Tipo
  if (filtros.tipo && typeof filtros.tipo === 'string') {
    const tipoFormatado = filtros.tipo.toUpperCase();
    if (tipoFormatado in TipoPedido) {
      whereClause.tipo = TipoPedido[tipoFormatado];
    }
  }
  // Filtro: Data
  const dateFilter = {};
  if (filtros.dataDe) dateFilter.gte = new Date(filtros.dataDe);
  if (filtros.dataAte) dateFilter.lte = new Date(filtros.dataAte);
  if (Object.keys(dateFilter).length > 0) {
    whereClause.dataHora = dateFilter;
  }
  // Filtro: LojaId (para Admin)
  if (filtros.lojaId && !whereBase.lojaId) {
    // Só adiciona se não for o filtro base
    if (!Number.isNaN(Number(filtros.lojaId)))
      whereClause.lojaId = Number(filtros.lojaId);
  }
  // Filtro: ClienteId (para Admin)
  if (filtros.clienteId && !whereBase.clienteId) {
    // Só adiciona se não for o filtro base
    if (typeof filtros.clienteId === 'string')
      whereClause.clienteId = filtros.clienteId;
  }

  // Execução das Queries
  try {
    const [pedidos, totalPedidos] = await txClient.$transaction([
      txClient.pedido.findMany({
        where: whereClause,
        include,
        orderBy,
        take: limit,
        skip,
      }),
      txClient.pedido.count({
        where: whereClause,
      }),
    ]);

    return {
      pedidos,
      paginacao: {
        totalItens: totalPedidos,
        itensPorPagina: limit,
        paginaAtual: page,
        totalPaginas: Math.ceil(totalPedidos / limit),
      },
    };
  } catch (error) {
    if (error.message.includes('Invalid date')) {
      throw new Error('Formato de data inválido. Use AAAA-MM-DD.');
    }
    console.error(`Erro ao listar pedidos com filtros: `, error);
    throw new Error('Não foi possível buscar os pedidos.');
  }
}

// --- Objeto da Máquina de Estados ---
// Define para quais estados um estado ATUAL pode ir.
// TODO: Verificar se está correto após implementar conexão com API de pagamentos
export const transicoesPermitidas = {
  // O usuário (cliente) pode cancelar nestes estados
  AGUARDANDO_PAGAMENTO: [StatusPedido.PENDENTE, StatusPedido.CANCELADO],
  PENDENTE: [StatusPedido.EM_PREPARO, StatusPedido.CANCELADO],
  // A loja assume daqui
  EM_PREPARO: [
    StatusPedido.PRONTO_PARA_ENTREGA,
    StatusPedido.PRONTO_PARA_RETIRADA,
    StatusPedido.CANCELADO, // Loja pode cancelar (ex: falta de item)
  ],
  PRONTO_PARA_ENTREGA: [StatusPedido.EM_ENTREGA],
  PRONTO_PARA_RETIRADA: [StatusPedido.REALIZADO],
  EM_ENTREGA: [StatusPedido.REALIZADO],
  // Estados Finais (não podem sair para nenhum outro)
  CANCELADO: [],
  REALIZADO: [],
};
