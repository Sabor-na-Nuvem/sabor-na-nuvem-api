import personalizavelServices from './personalizavel.services.js';

const personalizavelController = {
  async listarPersonalizaveisDoProduto(req, res) {
    try {
      const { produtoId } = req.params;

      if (Number.isNaN(Number(produtoId))) {
        return res
          .status(400)
          .json({ message: 'O ID do produto deve ser um número.' });
      }

      const personalizaveis =
        await personalizavelServices.listarPersonalizaveisDoProduto(
          Number(produtoId),
        );

      return res.status(200).json(personalizaveis);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({
        message: error.message || 'Erro ao listar grupos de personalização.',
      });
    }
  },

  async buscarPersonalizavelPorId(req, res) {
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

      const personalizavel =
        await personalizavelServices.buscarPersonalizavelPorId(
          Number(produtoId),
          Number(personalizavelId),
        );

      if (!personalizavel) {
        return res.status(404).json({
          message: 'Grupo de personalização não encontrado para este produto.',
        });
      }

      return res.status(200).json(personalizavel);
    } catch (error) {
      return res.status(500).json({
        message: error.message || 'Erro ao buscar grupo de personalização.',
      });
    }
  },

  async criarPersonalizavelParaProduto(req, res) {
    try {
      const { produtoId } = req.params;
      const dadosPersonalizavel = req.body;

      if (Number.isNaN(Number(produtoId))) {
        return res
          .status(400)
          .json({ message: 'O ID do produto deve ser um número.' });
      }

      if (
        !dadosPersonalizavel.nome ||
        dadosPersonalizavel.selecaoMinima == null ||
        dadosPersonalizavel.selecaoMaxima == null
      ) {
        return res.status(400).json({
          message:
            'Campos obrigatórios (nome, selecaoMinima, selecaoMaxima) não fornecidos.',
        });
      }

      const novoPersonalizavel =
        await personalizavelServices.criarPersonalizavelParaProduto(
          Number(produtoId),
          dadosPersonalizavel,
        );

      return res.status(201).json(novoPersonalizavel);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }

      return res.status(400).json({
        message: error.message || 'Erro ao criar grupo de personalização.',
      });
    }
  },

  async atualizarPersonalizavel(req, res) {
    try {
      const { produtoId, personalizavelId } = req.params;
      const novosDados = req.body;

      if (
        Number.isNaN(Number(produtoId)) ||
        Number.isNaN(Number(personalizavelId))
      ) {
        return res.status(400).json({
          message:
            'IDs do produto e do grupo de personalização devem ser números.',
        });
      }

      const personalizavelAtualizado =
        await personalizavelServices.atualizarPersonalizavel(
          Number(produtoId),
          Number(personalizavelId),
          novosDados,
        );

      return res.status(200).json(personalizavelAtualizado);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }

      return res.status(400).json({
        message: error.message || 'Erro ao atualizar grupo de personalização.',
      });
    }
  },

  async deletarPersonalizavel(req, res) {
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

      await personalizavelServices.deletarPersonalizavel(
        Number(produtoId),
        Number(personalizavelId),
      );

      return res.status(204).send();
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }

      return res.status(500).json({
        message: error.message || 'Erro ao deletar grupo de personalização.',
      });
    }
  },
};

export default personalizavelController;
