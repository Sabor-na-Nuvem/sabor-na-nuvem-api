import modificadorEmLojaServices from './modificador-em-loja.services.js';

const modificadorEmLojaController = {
  async listarModificadoresDaLoja(req, res) {
    try {
      const { lojaId } = req.params;
      const somenteDisponiveis = req.query.disponivel === 'true';

      if (Number.isNaN(Number(lojaId))) {
        return res
          .status(400)
          .json({ message: 'O ID da loja deve ser um número.' });
      }

      const modificadores =
        await modificadorEmLojaServices.listarModificadoresDaLoja(
          Number(lojaId),
          somenteDisponiveis,
        );

      return res.status(200).json(modificadores);
    } catch (error) {
      if (error.message.includes('não encontrada')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({
        message: error.message || 'Erro ao listar modificadores da loja.',
      });
    }
  },

  async buscarModificadorNaLoja(req, res) {
    try {
      const { lojaId, modificadorId } = req.params;

      if (Number.isNaN(Number(lojaId)) || Number.isNaN(Number(modificadorId))) {
        return res.status(400).json({
          message: 'O ID da loja e do modificador devem ser números.',
        });
      }

      const modificador =
        await modificadorEmLojaServices.buscarModificadorNaLoja(
          Number(lojaId),
          Number(modificadorId),
        );

      if (!modificador) {
        return res
          .status(404)
          .json({ message: 'Modificador não encontrado nesta loja.' });
      }

      return res.status(200).json(modificador);
    } catch (error) {
      return res.status(500).json({
        message: error.message || 'Erro ao buscar modificador na loja.',
      });
    }
  },

  async adicionarModificadorEmLoja(req, res) {
    try {
      const { lojaId } = req.params;
      const dadosModificadorEmLoja = req.body;

      if (
        Number.isNaN(Number(lojaId)) ||
        !dadosModificadorEmLoja.modificadorId ||
        Number.isNaN(Number(dadosModificadorEmLoja.modificadorId))
      ) {
        return res.status(400).json({
          message:
            'O ID da loja (URL) e o ID do modificador (corpo) devem ser números válidos.',
        });
      }

      const novoModificadorNaLoja =
        await modificadorEmLojaServices.adicionarModificadorEmLoja(
          Number(lojaId),
          dadosModificadorEmLoja,
        );

      return res.status(201).json(novoModificadorNaLoja);
    } catch (error) {
      if (error.message.includes('já existe')) {
        return res.status(400).json({ message: error.message });
      }
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({
        message: error.message || 'Erro ao adicionar modificador na loja.',
      });
    }
  },

  async atualizarModificadorNaLoja(req, res) {
    try {
      const { lojaId, modificadorId } = req.params;
      const novosDados = req.body;

      if (Number.isNaN(Number(lojaId)) || Number.isNaN(Number(modificadorId))) {
        return res.status(400).json({
          message: 'O ID da loja e do modificador devem ser números.',
        });
      }

      const modificadorAtualizado =
        await modificadorEmLojaServices.atualizarModificadorNaLoja(
          Number(lojaId),
          Number(modificadorId),
          novosDados,
        );

      return res.status(200).json(modificadorAtualizado);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({
        message: error.message || 'Erro ao atualizar modificador na loja.',
      });
    }
  },

  async deletarModificadorDaLoja(req, res) {
    try {
      const { lojaId, modificadorId } = req.params;

      if (Number.isNaN(Number(lojaId)) || Number.isNaN(Number(modificadorId))) {
        return res.status(400).json({
          message: 'O ID da loja e do modificador devem ser números.',
        });
      }

      await modificadorEmLojaServices.deletarModificadorDaLoja(
        Number(lojaId),
        Number(modificadorId),
      );

      return res.status(204).send();
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({
        message: error.message || 'Erro ao deletar modificador da loja.',
      });
    }
  },
};

export default modificadorEmLojaController;
