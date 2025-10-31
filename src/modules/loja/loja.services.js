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
      const loja = await prisma.loja.findUnique({
        where: { id: lojaId },
        include: { endereco: true },
      });

      return loja;
    } catch (error) {
      console.error(`Erro ao buscar a loja com ID ${lojaId}: `, error);
      throw new Error('Não foi possível buscar a loja.');
    }
  },

  async buscarLojasProximas(
    latitude,
    longitude,
    usarRaioDeEntrega = false,
    raioKm = 5,
  ) {
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      typeof raioKm !== 'number'
    ) {
      throw new Error('Latitude, longitude e raio devem ser números.');
    }

    const raioMetros = raioKm * 1000;

    try {
      const queryBase = Prisma.sql`
        SELECT
          l.id, l.nome, l."horarioFuncionamento", l."ofereceDelivery", l."raioEntregaKm",
          e.bairro, e.logradouro, e.numero,
          ST_Distance(
            ST_MakePoint(e.longitude::double precision, e.latitude::double precision)::geography,
            ST_MakePoint(${longitude}, ${latitude})::geography
          ) / 1000 AS distancia_km
        FROM "loja" AS l
        INNER JOIN "endereco" AS e ON l."enderecoId" = e.id
      `;

      let whereClause;

      if (usarRaioDeEntrega) {
        // Filtra por ST_DWithin usando o raio da PRÓPRIA loja
        whereClause = Prisma.sql`
        WHERE l."raioEntregaKm" IS NOT NULL AND ST_DWithin(
          ST_MakePoint(e.longitude::double precision, e.latitude::double precision)::geography,
          ST_MakePoint(${longitude}, ${latitude})::geography,
          l."raioEntregaKm" * 1000 -- Usa o raio da loja em metros
        )
      `;
      } else {
        // Filtra por ST_DWithin usando o raio FORNECIDO
        whereClause = Prisma.sql`
        WHERE ST_DWithin(
          ST_MakePoint(e.longitude::double precision, e.latitude::double precision)::geography,
          ST_MakePoint(${longitude}, ${latitude})::geography,
          ${raioMetros} -- Usa o raio fornecido em metros
        )
      `;
      }

      const orderByClause = Prisma.sql`ORDER BY distancia_km ASC`;

      const lojasProximas = await prisma.$queryRaw`
        ${queryBase}
        ${whereClause}
        ${orderByClause}
      `;

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

  async criarLoja(dadosCompletos) {
    try {
      const { loja: dadosLoja, endereco: dadosEndereco } = dadosCompletos;

      if (!dadosLoja || !dadosEndereco) {
        throw new Error('Dados da loja e do endereço são obrigatórios.');
      }

      if (dadosLoja.ofereceDelivery && dadosLoja.raioEntregaKm <= 0) {
        throw new Error(
          'O raio de entrega deve ser maior que zero, caso a loja ofereça deliveries.',
        );
      }

      const novaLojaComEndereco = await prisma.$transaction(async (tx) => {
        const novoEndereco = await tx.endereco.create({
          data: {
            cep: dadosEndereco.cep,
            estado: dadosEndereco.estado,
            cidade: dadosEndereco.cidade,
            bairro: dadosEndereco.bairro,
            logradouro: dadosEndereco.logradouro,
            numero: dadosEndereco.numero,
            complemento: dadosEndereco.complemento,
            pontoReferencia: dadosEndereco.pontoReferencia,
            latitude: dadosEndereco.latitude,
            longitude: dadosEndereco.longitude,
          },
        });

        const novaLoja = await tx.loja.create({
          data: {
            nome: dadosLoja.nome,
            cnpj: dadosLoja.cnpj,
            horarioFuncionamento: dadosLoja.horarioFuncionamento,
            ofereceDelivery: dadosLoja.ofereceDelivery,
            raioEntregaKm: dadosLoja.raioEntregaKm,
            enderecoId: novoEndereco.id,
          },
          include: {
            endereco: true,
          },
        });

        return novaLoja;
      });

      return novaLojaComEndereco;
    } catch (error) {
      if (error.code === 'P2002') {
        const target = error.meta?.target || [];
        if (target.includes('nome')) {
          throw new Error(
            `Já existe uma loja com o nome "${dadosCompletos.loja.nome}".`,
          );
        }
        if (target.includes('cnpj')) {
          throw new Error(
            `Já existe uma loja com o CNPJ "${dadosCompletos.loja.cnpj}".`,
          );
        }
        throw new Error('Já existe uma loja com estes dados (nome ou CNPJ).'); // Fallback
      }

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
      if (error.code === 'P2002') {
        const target = error.meta?.target || [];
        if (target.includes('nome')) {
          throw new Error(
            `Já existe outra loja com o nome "${novosDados.nome}".`,
          );
        }
        if (target.includes('cnpj')) {
          throw new Error(
            `Já existe outra loja com o CNPJ "${novosDados.cnpj}".`,
          );
        }
        throw new Error('Já existe outra loja com estes dados (nome ou CNPJ).'); // Fallback
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

      if (error.code === 'P2003') {
        throw new Error(
          `Não é possível deletar a loja com ID ${lojaId} pois existem registros associados a ela (pedidos, endereços, funcionários, etc.). Remova as associações primeiro.`,
        );
      }

      console.error(`Erro ao deletar a loja com ID ${lojaId}: `, error);
      throw new Error('Não foi possível deletar a loja.');
    }
  },
};

export default lojaServices;
