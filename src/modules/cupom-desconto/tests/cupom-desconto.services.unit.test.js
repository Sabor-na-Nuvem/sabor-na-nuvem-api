/* eslint-disable import/first */
import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../config/prisma.js', () => ({
  default: {
    cupomDesconto: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock do Crypto (usado em criarCupomFidelidade)
import crypto from 'crypto';

jest.spyOn(crypto, 'randomBytes').mockImplementation(() => ({
  toString: jest.fn().mockReturnValue('A1B2C3D4'),
}));

const prisma = (await import('../../../config/prisma.js')).default;
const cupomDescontoServices = (await import('../cupom-desconto.services.js'))
  .default;

// --- Início dos Testes ---
describe('Service: CupomDesconto', () => {
  // Limpa todos os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Testes para Funções CRUD Simples ---
  describe('CRUD (Simples)', () => {
    it('listarCupons: deve chamar findMany', async () => {
      prisma.cupomDesconto.findMany.mockResolvedValue([{ id: 1 }]);
      await cupomDescontoServices.listarCupons();
      expect(prisma.cupomDesconto.findMany).toHaveBeenCalledTimes(1);
    });

    it('buscarCupomPorId: deve chamar findUnique com ID', async () => {
      prisma.cupomDesconto.findUnique.mockResolvedValue({ id: 1 });
      await cupomDescontoServices.buscarCupomPorId(1);
      expect(prisma.cupomDesconto.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('buscarCupomPorCodigo: deve chamar findUnique com codCupom', async () => {
      prisma.cupomDesconto.findUnique.mockResolvedValue({
        id: 1,
        codCupom: 'TESTE',
      });
      await cupomDescontoServices.buscarCupomPorCodigo('TESTE');
      expect(prisma.cupomDesconto.findUnique).toHaveBeenCalledWith({
        where: { codCupom: 'TESTE' },
      });
    });

    it('buscarCuponsPorUsuario: deve chamar findMany com usuarioId e ativo:true', async () => {
      prisma.cupomDesconto.findMany.mockResolvedValue([]);
      await cupomDescontoServices.buscarCuponsPorUsuario('uuid-user-1');
      expect(prisma.cupomDesconto.findMany).toHaveBeenCalledWith({
        where: { usuarioId: 'uuid-user-1', ativo: true },
      });
    });
  });

  // --- Teste para criarCupom (Tratamento de Erros) ---
  describe('criarCupom', () => {
    const dadosCupom = {
      codCupom: 'NOVO',
      validade: new Date(),
      qtdUsos: 1,
      tipoDesconto: 'PERCENTUAL',
      valorDesconto: 10,
      usuarioId: null,
    };

    it('deve criar um cupom com sucesso (ativo default)', async () => {
      const mockCupom = { ...dadosCupom, id: 1, ativo: true }; // 'ativo' não foi passado
      prisma.cupomDesconto.create.mockResolvedValue(mockCupom);

      const resultado = await cupomDescontoServices.criarCupom(dadosCupom);

      expect(prisma.cupomDesconto.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          codCupom: 'NOVO',
          ativo: true, // Verificando o default ?? true
        }),
      });
      expect(resultado).toEqual(mockCupom);
    });

    it('deve respeitar ativo: false se for passado', async () => {
      const dadosCupomInativo = { ...dadosCupom, ativo: false };
      prisma.cupomDesconto.create.mockResolvedValue(dadosCupomInativo);

      await cupomDescontoServices.criarCupom(dadosCupomInativo);

      expect(prisma.cupomDesconto.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ ativo: false }),
        }),
      );
    });

    it('deve lançar erro P2002 (código duplicado)', async () => {
      prisma.cupomDesconto.create.mockRejectedValue({ code: 'P2002' });
      await expect(
        cupomDescontoServices.criarCupom(dadosCupom),
      ).rejects.toThrow('Já existe um cupom com o código "NOVO"');
    });

    it('deve lançar erro P2003 (usuário não encontrado)', async () => {
      const dadosCupomUser = { ...dadosCupom, usuarioId: 'uuid-fake' };
      prisma.cupomDesconto.create.mockRejectedValue({ code: 'P2003' });
      await expect(
        cupomDescontoServices.criarCupom(dadosCupomUser),
      ).rejects.toThrow('Usuário com ID uuid-fake não encontrado.');
    });
  });

  // --- Teste para criarCupomFidelidade (Lógica Complexa) ---
  describe('criarCupomFidelidade', () => {
    // Mock do 'tx' (cliente transacional)
    const mockTx = {
      cupomDesconto: {
        create: jest.fn(),
      },
    };
    const mockUsuarioId = 'uuid-user-1';

    it('deve criar um cupom de fidelidade com sucesso na primeira tentativa', async () => {
      const mockCupomCriado = { id: 1, codCupom: 'FID-A1B2C3D4' };
      // O mock do crypto (acima) já define o retorno como 'A1B2C3D4'
      mockTx.cupomDesconto.create.mockResolvedValue(mockCupomCriado);

      await cupomDescontoServices.criarCupomFidelidade(mockTx, mockUsuarioId);

      // Agora a verificação do codCupom deve bater
      expect(mockTx.cupomDesconto.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            codCupom: 'FID-A1B2C3D4',
            // ... (resto dos dados)
          }),
        }),
      );
    });

    it('deve tentar novamente se houver colisão de código (P2002)', async () => {
      const mockCupomCriado = { id: 2, codCupom: 'FID-SUCESSO' };
      mockTx.cupomDesconto.create
        .mockRejectedValueOnce({ code: 'P2002' })
        .mockResolvedValue(mockCupomCriado);

      // Configura o spy do crypto para retornar valores diferentes
      jest
        .spyOn(crypto, 'randomBytes')
        .mockImplementationOnce(() => ({ toString: () => 'COLISAO' }))
        .mockImplementationOnce(() => ({ toString: () => 'SUCESSO' }));

      await cupomDescontoServices.criarCupomFidelidade(mockTx, mockUsuarioId);

      expect(mockTx.cupomDesconto.create).toHaveBeenCalledTimes(2);
      expect(mockTx.cupomDesconto.create).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ codCupom: 'FID-SUCESSO' }),
        }),
      );
    });

    it('deve lançar erro após 5 tentativas de colisão', async () => {
      // Simula 5 falhas P2002 seguidas
      mockTx.cupomDesconto.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        cupomDescontoServices.criarCupomFidelidade(mockTx, mockUsuarioId),
      ).rejects.toThrow(
        'Não foi possível gerar um código de cupom único após 5 tentativas.',
      );

      expect(mockTx.cupomDesconto.create).toHaveBeenCalledTimes(5);
    });
  });

  // --- Teste para verificarValidadeCupom (PARAMETRIZADO) ---
  describe('verificarValidadeCupom', () => {
    const dataValida = new Date(Date.now() + 100000); // 100s no futuro
    const dataExpirada = new Date(Date.now() - 100000); // 100s no passado
    const usuarioA = 'uuid-user-A';
    const usuarioB = 'uuid-user-B';

    // 1. Array de "objetos como parâmetro"
    const casosDeVerificacao = [
      // desc, mockPrisma, inputUsuario, esperadoValido, esperadoMsg
      [
        'sucesso (padrão)',
        {
          id: 1,
          ativo: true,
          validade: dataValida,
          qtdUsos: 10,
          usuarioId: null,
        },
        usuarioA,
        true,
        'Cupom válido!',
      ],
      [
        'sucesso (ilimitado)',
        {
          id: 2,
          ativo: true,
          validade: dataValida,
          qtdUsos: null,
          usuarioId: null,
        },
        usuarioA,
        true,
        'Cupom válido!',
      ],
      [
        'sucesso (restrito ao usuário)',
        {
          id: 3,
          ativo: true,
          validade: dataValida,
          qtdUsos: 10,
          usuarioId: usuarioA,
        },
        usuarioA,
        true,
        'Cupom válido!',
      ],
      [
        'falha (não encontrado)',
        null,
        usuarioA,
        false,
        'Cupom não encontrado.',
      ],
      [
        'falha (inativo)',
        {
          id: 4,
          ativo: false,
          validade: dataValida,
          qtdUsos: 10,
          usuarioId: null,
        },
        usuarioA,
        false,
        'Este cupom não está mais ativo.',
      ],
      [
        'falha (expirado)',
        {
          id: 5,
          ativo: true,
          validade: dataExpirada,
          qtdUsos: 10,
          usuarioId: null,
        },
        usuarioA,
        false,
        'Cupom expirado.',
      ],
      [
        'falha (esgotado)',
        {
          id: 6,
          ativo: true,
          validade: dataValida,
          qtdUsos: 0,
          usuarioId: null,
        },
        usuarioA,
        false,
        'Cupom esgotado.',
      ],
      [
        'falha (usuário incompatível)',
        {
          id: 7,
          ativo: true,
          validade: dataValida,
          qtdUsos: 10,
          usuarioId: usuarioA,
        },
        usuarioB,
        false,
        'Este cupom não é válido para este usuário.',
      ],
    ];

    // 2. Bloco de teste único
    test.each(casosDeVerificacao)(
      'deve retornar $esperadoMsg para caso: $desc',
      async (desc, mockPrisma, inputUsuario, esperadoValido, esperadoMsg) => {
        // 1. Setup
        prisma.cupomDesconto.findUnique.mockResolvedValue(mockPrisma);

        // 2. Execução
        const resultado = await cupomDescontoServices.verificarValidadeCupom(
          'TESTE',
          inputUsuario,
        );

        // 3. Verificação
        expect(resultado.valido).toBe(esperadoValido);
        expect(resultado.mensagem).toBe(esperadoMsg);
      },
    );
  });

  // --- Teste para validarEUsarCupom (PARAMETRIZADO - Testes de FALHA) ---
  describe('validarEUsarCupom (Falhas)', () => {
    const mockTx = {
      cupomDesconto: { findUnique: jest.fn(), update: jest.fn() },
    };
    const dataValida = new Date(Date.now() + 100000);
    const dataExpirada = new Date(Date.now() - 100000);
    const usuarioA = 'uuid-user-A';
    const usuarioB = 'uuid-user-B';

    // 1. Array de "objetos como parâmetro"
    const casosDeFalha = [
      // desc, mockPrisma, inputUsuario, erroEsperado
      ['não encontrado', null, usuarioA, 'Cupom "TESTE" não encontrado.'],
      [
        'inativo',
        {
          id: 1,
          ativo: false,
          validade: dataValida,
          qtdUsos: 10,
          usuarioId: null,
        },
        usuarioA,
        'Cupom "TESTE" não está ativo.',
      ],
      [
        'expirado',
        {
          id: 2,
          ativo: true,
          validade: dataExpirada,
          qtdUsos: 10,
          usuarioId: null,
        },
        usuarioA,
        'Cupom "TESTE" expirado.',
      ],
      [
        'esgotado',
        {
          id: 3,
          ativo: true,
          validade: dataValida,
          qtdUsos: 0,
          usuarioId: null,
        },
        usuarioA,
        'Cupom "TESTE" já atingiu o limite de usos.',
      ],
      [
        'usuário incompatível',
        {
          id: 4,
          ativo: true,
          validade: dataValida,
          qtdUsos: 10,
          usuarioId: usuarioA,
        },
        usuarioB,
        'Cupom "TESTE" não é válido para este usuário.',
      ],
    ];

    // 2. Bloco de teste único
    test.each(casosDeFalha)(
      'deve lançar erro se o cupom for $desc',
      async (desc, mockPrisma, inputUsuario, erroEsperado) => {
        // 1. Setup
        mockTx.cupomDesconto.findUnique.mockResolvedValue(mockPrisma);

        // 2. Execução e 3. Verificação
        await expect(
          cupomDescontoServices.validarEUsarCupom(
            'TESTE',
            mockTx,
            inputUsuario,
          ),
        ).rejects.toThrow(erroEsperado);

        expect(mockTx.cupomDesconto.update).not.toHaveBeenCalled(); // Não deve tentar atualizar
      },
    );
  });

  // --- Teste para validarEUsarCupom (Sucesso) ---
  describe('validarEUsarCupom (Sucesso)', () => {
    const mockTx = {
      cupomDesconto: { findUnique: jest.fn(), update: jest.fn() },
    };
    const dataValida = new Date(Date.now() + 100000);

    it('deve decrementar qtdUsos se for limitado', async () => {
      const mockCupom = {
        id: 1,
        ativo: true,
        validade: dataValida,
        qtdUsos: 10,
        usuarioId: null,
      };
      mockTx.cupomDesconto.findUnique.mockResolvedValue(mockCupom);

      await cupomDescontoServices.validarEUsarCupom('TESTE', mockTx, null);

      expect(mockTx.cupomDesconto.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { qtdUsos: { decrement: 1 } },
      });
    });

    it('deve decrementar e desativar se qtdUsos for 1', async () => {
      const mockCupom = {
        id: 1,
        ativo: true,
        validade: dataValida,
        qtdUsos: 1,
        usuarioId: null,
      };
      mockTx.cupomDesconto.findUnique.mockResolvedValue(mockCupom);

      await cupomDescontoServices.validarEUsarCupom('TESTE', mockTx, null);

      expect(mockTx.cupomDesconto.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          qtdUsos: { decrement: 1 }, // Vai para 0
          ativo: false, // Desativa
        },
      });
    });

    it('NÃO deve chamar update se qtdUsos for null (ilimitado)', async () => {
      const mockCupom = {
        id: 1,
        ativo: true,
        validade: dataValida,
        qtdUsos: null,
        usuarioId: null,
      };
      mockTx.cupomDesconto.findUnique.mockResolvedValue(mockCupom);

      await cupomDescontoServices.validarEUsarCupom('TESTE', mockTx, null);

      expect(mockTx.cupomDesconto.update).not.toHaveBeenCalled();
    });
  });
});
