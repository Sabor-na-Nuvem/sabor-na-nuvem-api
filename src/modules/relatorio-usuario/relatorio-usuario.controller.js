import relatorioServices from './relatorio-usuario.services.js';

/**
 * Helper para validar o parâmetro 'limit'
 */
function validarLimit(queryLimit) {
  const limit = Number(queryLimit) || 10;
  if (Number.isNaN(limit) || limit <= 0 || limit > 100) {
    return {
      error: 'O parâmetro "limit" deve ser um número positivo, máximo 100.',
    };
  }
  return { limit };
}

const relatorioController = {
  async listarTopClientesPorGastoTotal(req, res) {
    const { limit, error: validationError } = validarLimit(req.query.limit);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    try {
      const topClientes = await relatorioServices.listarTopClientes(
        'gastosTotais',
        limit,
      );

      return res.status(200).json(topClientes);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async listarTopClientesPorGastoMensal(req, res) {
    const { limit, error: validationError } = validarLimit(req.query.limit);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    try {
      const topClientes = await relatorioServices.listarTopClientes(
        'gastosMensais',
        limit,
      );
      return res.status(200).json(topClientes);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async listarTopClientesPorQtdPedidosTotal(req, res) {
    const { limit, error: validationError } = validarLimit(req.query.limit);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    try {
      const topClientes = await relatorioServices.listarTopClientes(
        'qtdTotalPedidos',
        limit,
      );
      return res.status(200).json(topClientes);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async listarTopClientesPorQtdPedidosMensal(req, res) {
    const { limit, error: validationError } = validarLimit(req.query.limit);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    try {
      const topClientes = await relatorioServices.listarTopClientes(
        'qtdMensalPedidos',
        limit,
      );
      return res.status(200).json(topClientes);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};

export default relatorioController;
