import usuarioServices from './usuario.services.js';
import cupomDescontoServices from '../cupom-desconto/cupom-desconto.services.js';

const usuarioController = {
  // --- ROTAS PÚBLICAS ---
  async criarUsuario(req, res) {
    try {
      // TODO: Conectar com API de autenticação
      const dadosUsuario = req.body;

      const novoUsuario = await usuarioServices.criarUsuario(dadosUsuario);

      return res.status(201).json(novoUsuario);
    } catch (error) {
      if (error.message.includes('email já existe')) {
        return res.status(400).json({ message: error.message });
      }
      return res
        .status(500)
        .json({ message: error.message || 'Erro interno ao criar usuário.' });
    }
  },

  // --- ROTAS PARA O USUÁRIO AUTENTICADO (/me) ---
  // TODO: Adicionar middleware 'authenticate' a estas rotas

  async buscarUsuarioLogado(req, res) {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
      const usuario = await usuarioServices.buscarUsuarioPorId(usuarioId);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      return res.status(200).json(usuario);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async buscarCuponsDoUsuarioLogado(req, res) {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
      const cupons =
        await cupomDescontoServices.buscarCuponsPorUsuario(usuarioId);

      return res.status(200).json(cupons);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async atualizarUsuarioLogado(req, res) {
    const usuarioId = req.user?.id;
    const novosDados = req.body;

    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    // Impedir que o usuário atualize dados que não deveria
    delete novosDados.id;
    delete novosDados.email; // Fluxo de atualização próprio
    delete novosDados.cargo;
    delete novosDados.enderecoId;
    delete novosDados.funcionarioLojaId;
    delete novosDados.createdAt;
    delete novosDados.updatedAt;

    try {
      const usuarioAtualizado = await usuarioServices.atualizarUsuario(
        usuarioId,
        novosDados,
      );

      return res.status(200).json(usuarioAtualizado);
    } catch (error) {
      if (error.code === 'P2002') {
        return res
          .status(400)
          .json({ message: `Email "${novosDados.email}" já está em uso.` });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }
      return res.status(500).json({ message: error.message });
    }
  },

  async deletarUsuarioLogado(req, res) {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
      await usuarioServices.deletarUsuario(usuarioId);
      return res.status(204).send();
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      // TODO: Deletar em conjunto com a API de autenticação.
      return res.status(500).json({ message: error.message });
    }
  },

  // --- ROTAS ADMINISTRATIVAS ---
  // TODO: Adicionar middlewares 'authenticate' e 'authorizeAdmin'

  async buscarTodosOsUsuarios(req, res) {
    try {
      const filtros = req.query;
      const usuarios = await usuarioServices.buscarTodosOsUsuarios(filtros);

      return res.status(200).json(usuarios);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async buscarUsuarioPorId(req, res) {
    const { id } = req.params;
    const usuarioId = Number(id);

    if (Number.isNaN(usuarioId)) {
      return res
        .status(400)
        .json({ message: 'O ID do usuário deve ser um número.' });
    }

    try {
      const usuario = await usuarioServices.buscarUsuarioPorId(usuarioId);

      if (!usuario) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      return res.status(200).json(usuario);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async atualizarUsuarioPorId(req, res) {
    const { id } = req.params;
    const usuarioId = Number(id);
    const novosDados = req.body;

    if (Number.isNaN(usuarioId)) {
      return res
        .status(400)
        .json({ message: 'O ID do usuário deve ser um número.' });
    }

    // Impedir que o admin atualize dados que não deveria
    delete novosDados.id;
    delete novosDados.email;
    delete novosDados.enderecoId;
    delete novosDados.createdAt;
    delete novosDados.updatedAt;

    try {
      const usuarioAtualizado = await usuarioServices.atualizarUsuario(
        usuarioId,
        novosDados,
      );

      return res.status(200).json(usuarioAtualizado);
    } catch (error) {
      if (error.code === 'P2002') {
        return res
          .status(400)
          .json({ message: `Email "${novosDados.email}" já está em uso.` });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }
      return res.status(500).json({ message: error.message });
    }
  },

  async deletarUsuarioPorId(req, res) {
    const { id } = req.params;
    const usuarioId = Number(id);

    if (Number.isNaN(usuarioId)) {
      return res
        .status(400)
        .json({ message: 'O ID do usuário deve ser um número.' });
    }

    try {
      await usuarioServices.deletarUsuario(usuarioId);

      return res.status(204).send();
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      // TODO: Deletar em conjunto com a API de autenticação.
      return res.status(500).json({ message: error.message });
    }
  },
};

export default usuarioController;
