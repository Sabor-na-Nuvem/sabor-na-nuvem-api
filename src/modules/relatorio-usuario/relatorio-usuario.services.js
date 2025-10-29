import prisma from '../../config/prisma.js';

const relatorioService = {
  async listarTopClientes(criterio, limit) {
    const orderByFieldMap = {
      gastosTotais: 'gastosTotais',
      gastosMensais: 'gastosMensais',
      qtdTotalPedidos: 'qtdTotalPedidos',
      qtdMensalPedidos: 'qtdMensalPedidos',
    };

    const orderByField = orderByFieldMap[criterio];

    if (!orderByField) {
      throw new Error('Critério de ordenação inválido.');
    }

    try {
      const topClientesRelatorios = await prisma.relatorioUsuario.findMany({
        orderBy: {
          [orderByField]: 'desc',
        },
        take: limit,
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              cargo: true,
            },
          },
        },
      });

      return topClientesRelatorios;
    } catch (error) {
      console.error(`Erro ao buscar top clientes por "${criterio}": `, error);
      throw new Error('Não foi possível buscar os relatórios de top clientes.');
    }
  },
};

export default relatorioService;
