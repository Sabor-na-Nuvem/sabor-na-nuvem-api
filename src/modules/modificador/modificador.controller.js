import modificadorServices from './modificador.services.js';

const modificadorController = {
  async listarModificadoresDoPersonalizavel(req, res) {
    try {
      const { produtoId, personalizavelId } = req.params;

      if (
        Number.isNaN(Number(produtoId)) ||
        Number.isNaN(Number(personalizavelId))
      ) {
        return res.status(400).json({
          message:
            'IDs do produto e do grupo de personalização devem ser números.',
        });
      }

      const modificadores =
        await modificadorServices.listarModificadoresDoPersonalizavel(
          Number(personalizavelId),
        );

      return res.status(200).json(modificadores);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({
        message: error.message || 'Erro ao listar modificadores.',
      });
    }
  },

  async buscarModificadorPorId(req, res) {
    try {
      const { produtoId, personalizavelId, modificadorId } = req.params;

      if (
        Number.isNaN(Number(produtoId)) ||
        Number.isNaN(Number(modificadorId)) ||
        Number.isNaN(Number(personalizavelId))
      ) {
        return res.status(400).json({
          message:
            'IDs do produto, grupo de personalização e modificador devem ser números.',
        });
      }

      const modificador = await modificadorServices.buscarModificadorPorId(
        Number(personalizavelId),
        Number(modificadorId),
      );

      if (!modificador) {
        return res.status(404).json({
          message:
            'Modificador não encontrado para este grupo de personalização.',
        });
      }

      return res.status(200).json(modificador);
    } catch (error) {
      return res.status(500).json({
        message: error.message || 'Erro ao buscar modificador.',
      });
    }
  },

  async criarModificador(req, res) {
    try {
      const { produtoId, personalizavelId } = req.params;
      const dadosModificador = req.body;

      if (
        Number.isNaN(Number(produtoId)) ||
        Number.isNaN(Number(personalizavelId))
      ) {
        return res.status(400).json({
          message:
            'IDs do produto e do grupo de personalização devem ser números.',
        });
      }

      if (!dadosModificador.nome) {
        return res.status(400).json({
          message: 'Campo obrigatório (nome) não fornecido.',
        });
      }

      const novoModificador = await modificadorServices.criarModificador(
        Number(produtoId),
        Number(personalizavelId),
        dadosModificador,
      );

      return res.status(201).json(novoModificador);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }

      return res.status(400).json({
        message: error.message || 'Erro ao criar modificador.',
      });
    }
  },

  async atualizarModificador(req, res) {
    try {
      const { produtoId, personalizavelId, modificadorId } = req.params;
      const novosDados = req.body;

      if (
        Number.isNaN(Number(produtoId)) ||
        Number.isNaN(Number(modificadorId)) ||
        Number.isNaN(Number(personalizavelId))
      ) {
        return res.status(400).json({
          message:
            'IDs do produto, grupo de personalização e modificador devem ser números.',
        });
      }

      if (!novosDados) {
        return res.status(400).json({
          message: 'Dados não fornecidos.',
        });
      }

      const modificadorAtualizado =
        await modificadorServices.atualizarModificador(
          Number(produtoId),
          Number(personalizavelId),
          Number(modificadorId),
          novosDados,
        );

      return res.status(200).json(modificadorAtualizado);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }

      return res.status(400).json({
        message: error.message || 'Erro ao atualizar modificador.',
      });
    }
  },

  async deletarModificador(req, res) {
    try {
      const { produtoId, personalizavelId, modificadorId } = req.params;

      if (
        Number.isNaN(Number(produtoId)) ||
        Number.isNaN(Number(modificadorId)) ||
        Number.isNaN(Number(personalizavelId))
      ) {
        return res.status(400).json({
          message:
            'IDs do produto, grupo de personalização e modificador devem ser números.',
        });
      }

      await modificadorServices.deletarModificador(
        Number(produtoId),
        Number(personalizavelId),
        Number(modificadorId),
      );

      return res.status(204).send();
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }

      return res.status(500).json({
        message: error.message || 'Erro ao deletar modificador.',
      });
    }
  },
};

export default modificadorController;
