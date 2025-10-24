import cupomDescontoServices from './cupom-desconto.services.js';

const cupomDescontoController = {
  async listarCupons(req, res) {
    try {
      const cupons = await cupomDescontoServices.listarCupons();

      return res.status(200).json(cupons);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async buscarCupomPorId(req, res) {
    try {
      const { id } = req.params;

      if (Number.isNaN(Number(id))) {
        return res
          .status(400)
          .json({ message: 'O ID do cupom deve ser um número.' });
      }

      const cupom = await cupomDescontoServices.buscarCupomPorId(Number(id));

      return res.status(200).json(cupom);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async buscarCupomPorCodigo(req, res) {
    try {
      const { codigoCupom } = req.body;

      if (
        !codigoCupom ||
        typeof codCupom !== 'string' ||
        codigoCupom.trim() === ''
      ) {
        return res
          .status(400)
          .json({ message: 'O código do cupom é obrigatório.' });
      }

      const cupom =
        await cupomDescontoServices.buscarCupomPorCodigo(codigoCupom);

      return res.status(200).json(cupom);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async criarCupom(req, res) {
    try {
      const dadosCupom = req.body;

      if (!dadosCupom) {
        return res
          .status(400)
          .json({ message: 'Os dados do cupom são obrigatórios.' });
      }

      const novoCupom = await cupomDescontoServices.criarCupom(dadosCupom);

      return res.status(201).json(novoCupom);
    } catch (error) {
      if (error.message.includes('Já existe um cupom')) {
        return res.status(400).json({ message: error.message });
      }

      return res
        .status(500)
        .json({ message: error.message || 'Erro interno ao criar cupom.' });
    }
  },

  async atualizarCupom(req, res) {
    try {
      const { id } = req.params;
      const novosDados = req.body;

      if (Number.isNaN(Number(id))) {
        return res
          .status(400)
          .json({ message: 'O ID do cupom deve ser um número.' });
      }

      const cupomAtualizado = await cupomDescontoServices.atualizarCupom(
        Number(id),
        novosDados,
      );

      return res.status(200).json(cupomAtualizado);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }
  },

  async deletarCupom(req, res) {
    try {
      const { id } = req.params;

      if (Number.isNaN(Number(id))) {
        return res
          .status(400)
          .json({ message: 'O ID do cupom deve ser um número.' });
      }

      await cupomDescontoServices.deletarCupom(Number(id));

      return res.status(204).send();
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  },

  async validarCupom(req, res) {
    try {
      const { codigoCupom } = req.body;

      if (
        !codigoCupom ||
        typeof codCupom !== 'string' ||
        codigoCupom.trim() === ''
      ) {
        return res
          .status(400)
          .json({ message: 'O código do cupom é obrigatório.' });
      }

      // TODO: Se a validação depender do usuário, pegue o ID do usuário autenticado

      const resultadoValidacao = await cupomDescontoServices.validarCupom(
        codigoCupom.trim(),
        // usuarioId,    // Passa o ID do usuário se a validação depender dele
      );

      return res.status(200).json(resultadoValidacao);
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Erro interno ao validar o cupom.' });
    }
  },
};

export default cupomDescontoController;
