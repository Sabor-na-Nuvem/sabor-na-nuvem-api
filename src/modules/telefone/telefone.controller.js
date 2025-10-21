import telefoneServices from './telefone.services.js';

const telefoneController = {
  async listarTelefonesDoPai(req, res) {
    const { usuarioId, lojaId } = req.params;
    const idDoPai = usuarioId ? Number(usuarioId) : Number(lojaId);
    const tipoDoPai = usuarioId ? 'usuario' : 'loja';

    if (Number.isNaN(idDoPai)) {
      return res.status(400).json({
        message: `O ID ${tipoDoPai === 'usuario' ? 'do' : 'da'} ${tipoDoPai} deve ser um número.`,
      });
    }

    try {
      const telefones = await telefoneServices.listarTelefonesDoPai(
        idDoPai,
        tipoDoPai,
      );

      return res.status(200).json(telefones);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async buscarTelefoneDoPaiPorId(req, res) {
    const { usuarioId, lojaId, telefoneId } = req.params;
    const idDoPai = usuarioId ? Number(usuarioId) : Number(lojaId);
    const tipoDoPai = usuarioId ? 'usuario' : 'loja';

    if (Number.isNaN(idDoPai) || Number.isNaN(Number(telefoneId))) {
      return res.status(400).json({
        message: `Os IDs ${tipoDoPai === 'usuario' ? 'do' : 'da'} ${tipoDoPai} e do telefone devem ser números.`,
      });
    }

    try {
      const telefone = await telefoneServices.buscarTelefoneDoPaiPorId(
        idDoPai,
        tipoDoPai,
        telefoneId,
      );

      if (!telefone) {
        return res.status(404).json({
          message: `Telefone não encontrado para ${tipoDoPai === 'usuario' ? 'este' : 'esta'} ${tipoDoPai}.`,
        });
      }

      return res.status(200).json(telefone);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async adicionarTelefoneAoPai(req, res) {
    const { usuarioId, lojaId } = req.params;
    const dadosTelefone = req.body;
    const idDoPai = usuarioId ? Number(usuarioId) : Number(lojaId);
    const tipoDoPai = usuarioId ? 'usuario' : 'loja';

    if (Number.isNaN(idDoPai)) {
      return res.status(400).json({
        message: `O ID ${tipoDoPai === 'usuario' ? 'do' : 'da'} ${tipoDoPai} deve ser um número.`,
      });
    }

    try {
      const novoTelefone = await telefoneServices.adicionarTelefoneAoPai(
        idDoPai,
        tipoDoPai,
        dadosTelefone,
      );

      return res.status(201).json(novoTelefone);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }

      if (error.message.includes('já está cadastrado')) {
        return res.status(400).json({ message: error.message });
      }

      return res
        .status(500)
        .json({ message: 'Erro interno ao adicionar telefone.' });
    }
  },

  async atualizarTelefoneDoPai(req, res) {
    const { usuarioId, lojaId, telefoneId } = req.params;
    const novosDados = req.body;
    const idDoPai = usuarioId ? Number(usuarioId) : Number(lojaId);
    const tipoDoPai = usuarioId ? 'usuario' : 'loja';

    if (Number.isNaN(idDoPai) || Number.isNaN(Number(telefoneId))) {
      return res.status(400).json({
        message: `Os IDs ${tipoDoPai === 'usuario' ? 'do' : 'da'} ${tipoDoPai} e do telefone devem ser números.`,
      });
    }

    try {
      const telefoneAtualizado = await telefoneServices.atualizarTelefoneDoPai(
        idDoPai,
        tipoDoPai,
        telefoneId,
        novosDados,
      );

      return res.status(200).json(telefoneAtualizado);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }
  },

  async deletarTelefoneDoPai(req, res) {
    const { usuarioId, lojaId, telefoneId } = req.params;
    const idDoPai = usuarioId ? Number(usuarioId) : Number(lojaId);
    const tipoDoPai = usuarioId ? 'usuario' : 'loja';

    if (Number.isNaN(idDoPai) || Number.isNaN(Number(telefoneId))) {
      return res.status(400).json({
        message: `Os IDs ${tipoDoPai === 'usuario' ? 'do' : 'da'} ${tipoDoPai} e do telefone devem ser números.`,
      });
    }

    try {
      await telefoneServices.deletarTelefoneDoPai(
        idDoPai,
        tipoDoPai,
        telefoneId,
      );

      return res.status(204).send();
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  },
};

export default telefoneController;
