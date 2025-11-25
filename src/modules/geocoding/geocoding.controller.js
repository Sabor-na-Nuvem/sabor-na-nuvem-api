import geocodingService from './geocoding.services.js';

const geocodingController = {
  async buscarCoordenadas(req, res) {
    try {
      const { endereco } = req.query; // Espera ?endereco="Rua X, 123..."

      if (!endereco) {
        return res
          .status(400)
          .json({ message: 'O parâmetro "endereco" é obrigatório.' });
      }

      const coordenadas = await geocodingService.buscarCoordenadas(endereco);

      if (!coordenadas) {
        return res
          .status(404)
          .json({ message: 'Endereço não encontrado no mapa.' });
      }

      return res.status(200).json(coordenadas);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async buscarEnderecoReverso(req, res) {
    try {
      const { lat, lon } = req.query;

      if (!lat || !lon) {
        return res
          .status(400)
          .json({ message: 'Latitude e Longitude são obrigatórias.' });
      }

      const endereco = await geocodingService.buscarEnderecoPorCoordenadas(
        lat,
        lon,
      );

      if (!endereco) {
        return res
          .status(404)
          .json({ message: 'Endereço não encontrado para estas coordenadas.' });
      }

      return res.status(200).json(endereco);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};

export default geocodingController;
