import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma.js';

const lojaServices = {
  async buscarTodasAsLojas() {
    try {
      const lojas = await prisma.loja.findMany();

      return lojas;
    } catch (error) {
      console.error('Erro ao buscar todas as lojas: ', error);
      throw new Error('Não foi possível buscar as lojas.');
    }
  },

  async buscarLoja(lojaId) {
    try {
      const loja = await prisma.loja.findUnique({ where: { id: lojaId } });

      return loja;
    } catch (error) {
      console.error(`Erro ao buscar a loja com ID ${lojaId}: `, error);
      throw new Error('Não foi possível buscar a loja.');
    }
  },

  async buscarLojasProximas(latitude, longitude, raioKm = 5) {
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      typeof raioKm !== 'number'
    ) {
      throw new Error('Latitude, longitude e raio devem ser números.');
    }

    const raioMetros = raioKm * 1000;

    try {
      const lojasProximas = await prisma.$queryRaw(Prisma.sql`
        SELECT
          l.id,
          l.nome,
          l."horarioFuncionamento", -- Use aspas se o nome da coluna tiver maiúsculas
          l."ofereceDelivery",
          l."raioEntregaKm",
          e.bairro,
          e.logradouro,
          e.numero,
          ST_Distance(
            ST_MakePoint(e.longitude::double precision, e.latitude::double precision)::geography, -- Ponto da loja
            ST_MakePoint(${longitude}, ${latitude})::geography                                    -- Ponto do usuário
          ) / 1000 AS distancia_km
        FROM "loja" AS l
        INNER JOIN "endereco" AS e ON l."enderecoId" = e.id
        WHERE
          ST_DWithin(
            ST_MakePoint(e.longitude::double precision, e.latitude::double precision)::geography, -- Ponto da loja
            ST_MakePoint(${longitude}, ${latitude})::geography,                                   -- Ponto do usuário
            ${raioMetros}
          )
        ORDER BY
          distancia_km ASC;
      `);

      return lojasProximas.map((loja) => ({
        ...loja,
        distancia_km: parseFloat(loja.distancia_km),
        raioEntregaKm: loja.raioEntregaKm
          ? parseFloat(loja.raioEntregaKm)
          : null,
      }));
    } catch (error) {
      console.error('Erro ao buscar lojas próximas:', error);
      throw new Error('Não foi possível buscar lojas próximas.');
    }
  },

  async criarLoja(dadosLoja) {
    try {
      const novaLoja = await prisma.loja.create({
        data: dadosLoja,
      });

      return novaLoja;
    } catch (error) {
      console.error('Erro ao criar loja: ', error);
      throw new Error('Não foi possível criar a loja.');
    }
  },

  async atualizarLoja(lojaId, novosDados) {
    try {
      const lojaAtualizada = await prisma.loja.update({
        where: {
          id: lojaId,
        },
        data: novosDados,
      });

      return lojaAtualizada;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Loja com ID ${lojaId} não encontrada.`);
      }
      console.error(`Erro ao atualizar a loja com ID ${lojaId}: `, error);
      throw new Error('Não foi possível atualizar a loja.');
    }
  },

  async deletarLoja(lojaId) {
    try {
      const lojaDeletada = await prisma.loja.delete({
        where: {
          id: lojaId,
        },
      });

      return lojaDeletada;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Loja com ID ${lojaId} não encontrada.`);
      }
      console.error(`Erro ao deletar a loja com ID ${lojaId}: `, error);
      throw new Error('Não foi possível deletar a loja.');
    }
  },
};

export default lojaServices;
