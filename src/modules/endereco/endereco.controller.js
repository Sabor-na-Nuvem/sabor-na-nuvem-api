import enderecoServices from './endereco.services.js';

const enderecoController = {
  async buscarEnderecoDoPai(req, res) {
    const { usuarioId, lojaId } = req.params;
    const idDoPai = usuarioId ? Number(usuarioId) : Number(lojaId);
    const tipoDoPai = usuarioId ? 'usuario' : 'loja';

    if (Number.isNaN(idDoPai)) {
      return res.status(400).json({
        message: `O ID ${tipoDoPai === 'usuario' ? 'do' : 'da'} ${tipoDoPai} deve ser um número.`,
      });
    }

    try {
      const endereco = await enderecoServices.buscarEnderecoDoPai(
        idDoPai,
        tipoDoPai,
      );

      if (!endereco) {
        return res.status(404).json({
          message: `Endereço não encontrado para ${tipoDoPai === 'usuario' ? 'este' : 'esta'} ${tipoDoPai}.`,
        });
      }

      return res.status(200).json(endereco);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async criarEnderecoParaPai(req, res) {
    const { usuarioId, lojaId } = req.params;
    const dadosEndereco = req.body;
    const idDoPai = usuarioId ? Number(usuarioId) : Number(lojaId);
    const tipoDoPai = usuarioId ? 'usuario' : 'loja';

    if (Number.isNaN(idDoPai)) {
      return res.status(400).json({
        message: `O ID ${tipoDoPai === 'usuario' ? 'do' : 'da'} ${tipoDoPai} deve ser um número.`,
      });
    }

    try {
      const novoEndereco = await enderecoServices.criarEnderecoParaPai(
        idDoPai,
        tipoDoPai,
        dadosEndereco,
      );

      return res.status(201).json(novoEndereco);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }

      if (error.message.includes('já possui')) {
        return res.status(400).json({ message: error.message });
      }

      return res
        .status(500)
        .json({ message: 'Erro interno ao adicionar endereço.' });
    }
  },

  async atualizarEnderecoDoPai(req, res) {
    const { usuarioId, lojaId } = req.params;
    const novosDados = req.body;
    const idDoPai = usuarioId ? Number(usuarioId) : Number(lojaId);
    const tipoDoPai = usuarioId ? 'usuario' : 'loja';

    if (Number.isNaN(idDoPai)) {
      return res.status(400).json({
        message: `O ID ${tipoDoPai === 'usuario' ? 'do' : 'da'} ${tipoDoPai} deve ser um número.`,
      });
    }

    try {
      const enderecoAtualizado = await enderecoServices.atualizarEnderecoDoPai(
        idDoPai,
        tipoDoPai,
        novosDados,
      );

      return res.status(200).json(enderecoAtualizado);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }
  },

  async deletarEnderecoDoPai(req, res) {
    const { usuarioId, lojaId } = req.params;
    const idDoPai = usuarioId ? Number(usuarioId) : Number(lojaId);
    const tipoDoPai = usuarioId ? 'usuario' : 'loja';

    if (Number.isNaN(idDoPai)) {
      return res.status(400).json({
        message: `O ID ${tipoDoPai === 'usuario' ? 'do' : 'da'} ${tipoDoPai} deve ser um número.`,
      });
    }

    try {
      await enderecoServices.deletarEnderecoDoPai(idDoPai, tipoDoPai);

      return res.status(204).send();
    } catch (error) {
      if (
        error.message.includes('Não é possível deletar o endereço de uma loja')
      ) {
        return res.status(400).json({
          message: error.message,
          suggestion: 'Use a rota PUT para atualizar o endereço existente.',
        });
      }
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  },
};

export default enderecoController;
