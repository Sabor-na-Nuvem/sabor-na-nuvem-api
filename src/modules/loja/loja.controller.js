import lojaServices from './loja.services.js';

const lojaController = {
  async buscarTodasAsLojas(req, res) {
    try {
      const lojas = await lojaServices.buscarTodasAsLojas();

      return res.status(200).json(lojas);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async buscarLoja(req, res) {
    try {
      const { id } = req.params;

      if (Number.isNaN(Number(id))) {
        return res
          .status(400)
          .json({ message: 'O ID da loja deve ser um número.' });
      }

      const loja = await lojaServices.buscarLoja(Number(id));

      return res.status(200).json(loja);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async buscarLojasProximas(req, res) {
    try {
      const latitude = parseFloat(req.query.latitude);
      const longitude = parseFloat(req.query.longitude);
      const raioKm = req.query.raioKm
        ? parseFloat(req.query.raioKm)
        : undefined;

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return res.status(400).json({
          message: 'Latitude e longitude são obrigatórias e devem ser números.',
        });
      }
      if (raioKm !== undefined && Number.isNaN(raioKm)) {
        return res
          .status(400)
          .json({ message: 'Raio (raioKm) deve ser um número.' });
      }

      const lojasProximas = await lojaServices.buscarLojasProximas(
        latitude,
        longitude,
        raioKm,
      );

      return res.status(200).json(lojasProximas);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async criarLoja(req, res) {
    try {
      const dadosLoja = req.body;
      const novaLoja = await lojaServices.criarLoja(dadosLoja);

      return res.status(201).json(novaLoja);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async atualizarLoja(req, res) {
    try {
      const { id } = req.params;
      const novosDados = req.body;

      if (Number.isNaN(Number(id))) {
        return res
          .status(400)
          .json({ message: 'O ID da loja deve ser um número.' });
      }

      const lojaAtualizada = await lojaServices.atualizarLoja(
        Number(id),
        novosDados,
      );

      return res.status(200).json(lojaAtualizada);
    } catch (error) {
      if (error.message.includes('não encontrada')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }
  },

  async deletarLoja(req, res) {
    try {
      const { id } = req.params;

      if (Number.isNaN(Number(id))) {
        return res
          .status(400)
          .json({ message: 'O ID da loja deve ser um número.' });
      }

      await lojaServices.deletarLoja(Number(id));

      return res.status(204).send();
    } catch (error) {
      if (error.message.includes('não encontrada')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  },
};

export default lojaController;
