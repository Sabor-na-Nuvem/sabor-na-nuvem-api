const geocodingService = {
  async buscarCoordenadas(query) {
    if (!query) {
      throw new Error('O parâmetro de busca é obrigatório.');
    }

    // Monta a URL do Nominatim
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query,
    )}&limit=1`;

    try {
      const response = await fetch(url, {
        headers: {
          // O Nominatim EXIGE um User-Agent válido para não bloquear a requisição
          'User-Agent': 'SaborNaNuvem-API/1.0 (jmatheus12349@gmail.com)',
          'Accept-Language': 'pt-BR',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro no serviço de mapas: ${response.statusText}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          display_name: data[0].display_name,
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
      throw new Error('Falha ao conectar com o serviço de geocodificação.');
    }
  },

  async buscarEnderecoPorCoordenadas(lat, lon) {
    if (!lat || !lon) throw new Error('Latitude e Longitude são obrigatórias.');

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SaborNaNuvem-API/1.0 (jmatheus12349@gmail.com)',
          'Accept-Language': 'pt-BR',
        },
      });

      if (!response.ok)
        throw new Error(`Erro no serviço de mapas: ${response.statusText}`);

      const data = await response.json();

      if (data && data.address) {
        const a = data.address;
        return {
          cep: a.postcode ? a.postcode.replace(/\D/g, '') : '',
          logradouro: a.road || a.pedestrian || a.street || '',
          numero: a.house_number || '',
          bairro: a.suburb || a.neighbourhood || a.residential || '',
          cidade: a.city || a.town || a.municipality || '',
          estado: a.state || '',
          display_name: data.display_name,
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar endereço reverso:', error);
      throw new Error('Falha ao conectar com o serviço de geocodificação.');
    }
  },
};

export default geocodingService;
