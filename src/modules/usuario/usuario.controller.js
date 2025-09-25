const usuarioController = {
  // Função para obter todos os usuários (por enquanto, retorna dados falsos)
  getAllUsuarios(req, res) {
    const users = [
      { id: 1, name: 'Fulano de Tal' },
      { id: 2, name: 'Ciclana da Silva' },
    ];
    res.status(200).json(users);
  },
};

export default usuarioController;