import cron from 'node-cron';
import prisma from '../config/prisma.js';
// import { StatusPedido } from '@prisma/client';

console.log('Agendador (Scheduler) iniciado.');

/**
 * Zera os contadores mensais de todos os usuários.
 * Roda à 00:01 do dia 1 de cada mês.
 */
const resetarContadoresMensaisJob = cron.schedule(
  '1 0 1 * *',
  async () => {
    console.log('Executando job: Resetar Contadores Mensais de Relatórios...');
    try {
      const { count } = await prisma.relatorioUsuario.updateMany({
        // Atualiza TODOS os relatórios
        where: {},
        data: {
          gastosMensais: 0.0,
          qtdMensalPedidos: 0,
        },
      });
      console.log(
        `Contadores mensais resetados com sucesso para ${count} usuários.`,
      );
    } catch (error) {
      console.error(
        'Erro ao executar o job de resetar contadores mensais:',
        error,
      );
    }
  },
  {
    scheduled: true,
    timezone: 'America/Sao_Paulo',
  },
);

/**
 * Desativa cupons cuja data de validade já passou.
 * Roda todo dia às 3:00 da manhã.
 */
const desativarCuponsExpiradosJob = cron.schedule('0 3 * * *', async () => {
  console.log('Executando job: Desativar Cupons Expirados...');
  try {
    const { count } = await prisma.cupomDesconto.updateMany({
      where: {
        ativo: true, // Busca cupons que ainda estão marcados como ativos
        validade: {
          lt: new Date(), // 'lt' (less than): Onde a validade é MENOR que a data/hora atual
        },
      },
      data: {
        ativo: false,
      },
    });
    if (count > 0) {
      console.log(`Job: ${count} cupons expirados foram desativados.`);
    }
  } catch (error) {
    console.error('Erro ao executar o job de desativar cupons:', error);
  }
});

/**
 * Limpa carrinhos abandonados (não atualizados há mais de 30 dias).
 * Roda todo dia às 3:15 da manhã.
 */
const limparCarrinhosAntigosJob = cron.schedule('15 3 * * *', async () => {
  console.log('Executando job: Limpar Carrinhos Abandonados...');
  try {
    const dataLimite = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const { count } = await prisma.carrinho.deleteMany({
      where: {
        updatedAt: {
          lt: dataLimite, // Onde a última atualização foi ANTES de 30 dias atrás
        },
      },
    });
    if (count > 0) {
      console.log(`Job: ${count} carrinhos abandonados foram limpos.`);
    }
  } catch (error) {
    console.error('Erro ao executar o job de limpar carrinhos:', error);
  }
});

/**
 * Cancela pedidos pendentes ou aguardando pagamento por muito tempo.
 * Roda a cada 5 minutos.
 */
// const cancelarPedidosAntigosJob = cron.schedule('*/5 * * * *', async () => {
//   console.log('Executando job: Verificar pedidos pendentes...');
//   try {
//     const tempoLimitePagamento = new Date(Date.now() - 60 * 60 * 1000); // 1 hora atrás
//     const tempoLimitePendente = new Date(Date.now() - 30 * 60 * 1000); // 30 minutos atrás

//     const { count } = await prisma.pedido.updateMany({
//       where: {
//         OR: [
//           // Se aguarda pagamento há mais de 1 hora
//           {
//             status: StatusPedido.AGUARDANDO_PAGAMENTO,
//             createdAt: { lt: tempoLimitePagamento },
//           },
//           // Se está pendente (aguardando aceite da loja) há mais de 30 minutos
//           {
//             status: StatusPedido.PENDENTE,
//             createdAt: { lt: tempoLimitePendente },
//           },
//         ],
//       },
//       data: {
//         status: StatusPedido.CANCELADO,
//       },
//     });

//     if (count > 0) {
//       console.log(
//         `Job: ${count} pedidos foram cancelados automaticamente (timeout).`,
//       );
//       // TODO: Para cada pedido cancelado:
//       // 1. Chamar a API de pagamento para reverter a autorização (estorno), se houver.
//       // 2. Enviar uma notificação (email/push) ao usuário informando o cancelamento.
//     }
//   } catch (error) {
//     console.error('Erro ao executar o job de cancelar pedidos:', error);
//   }
// });

export {
  resetarContadoresMensaisJob,
  desativarCuponsExpiradosJob,
  limparCarrinhosAntigosJob,
  // cancelarPedidosAntigosJob,
};
