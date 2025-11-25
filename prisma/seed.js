import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoriasData = [
  {
    nome: 'Destaques do Dia',
    descricao:
      'Nossas melhores ofertas e os itens mais pedidos selecionados especialmente para hoje.',
  },
  {
    nome: 'Combos & Ofertas',
    descricao:
      'Refeições completas com lanche, acompanhamento e bebida por um preço especial.',
  },
  {
    nome: 'Hambúrgueres',
    descricao:
      'Nossos clássicos hambúrgueres artesanais com carne suculenta e molhos especiais.',
  },
  {
    nome: 'Lanches de Frango',
    descricao:
      'Crocantes e saborosos: sanduíches de frango, nuggets e tirinhas empanadas.',
  },
  {
    nome: 'Acompanhamentos',
    descricao:
      'Batatas fritas, anéis de cebola e outros petiscos perfeitos para completar seu pedido.',
  },
  {
    nome: 'Vegetarianos & Leves',
    descricao:
      'Opções deliciosas sem carne, saladas frescas e wraps saudáveis.',
  },
  {
    nome: 'Bebidas',
    descricao: 'Refrigerantes gelados, sucos naturais, chás e água.',
  },
  {
    nome: 'Sobremesas & Shakes',
    descricao:
      'Sorvetes, milkshakes cremosos, tortas e doces para finalizar com chave de ouro.',
  },
  {
    nome: 'Menu Kids',
    descricao:
      'Porções na medida certa para as crianças, acompanhadas de brindes divertidos.',
  },
];

const produtosSeed = [
  // --- 1. DESTAQUES DO DIA (Exatos 3) ---
  {
    nome: 'Mega Bacon Supreme',
    descricao:
      'Dois hambúrgueres de 180g, triplo bacon, queijo cheddar derretido e cebola caramelizada.',
    preco: 42.9,
    categoria: 'Destaques do Dia',
    imagemUrl:
      'https://img.freepik.com/fotos-gratis/saboroso-hamburguer-de-carne-com-queijo-e-salada-de-frente_23-2148868221.jpg',
    personalizavel: true, // ADD: Personalização de ponto e retirar itens
  },
  {
    nome: 'Combo Casal',
    descricao:
      '2 X-Saladas Clássicos + 2 Batatas Médias + 2 Refrigerantes Lata.',
    preco: 69.9,
    categoria: 'Destaques do Dia',
    // Sem personalização complexa neste seed para simplificar combos
  },
  {
    nome: 'Milkshake de Nutella (500ml)',
    descricao:
      'O favorito da casa! Sorvete de baunilha batido com muita Nutella e chantilly.',
    preco: 24.9,
    categoria: 'Destaques do Dia',
    personalizavel: true, // ADD: Personalização de adicionais
  },

  // --- 2. HAMBÚRGUERES ---
  {
    nome: 'X-Salada Clássico',
    descricao:
      'Pão brioche, carne 150g, queijo prato, alface americana, tomate e maionese verde.',
    preco: 28.0,
    categoria: 'Hambúrgueres',
    personalizavel: true,
  },
  {
    nome: 'Cheddar Melt',
    descricao:
      'Pão australiano, carne 180g e muito creme de cheddar com cebola ao shoyu.',
    preco: 32.5,
    categoria: 'Hambúrgueres',
    personalizavel: true, // ADD: Ponto da carne
  },
  {
    nome: 'Smash Burger Duplo',
    descricao:
      'Dois smash burgers de 90g prensados na chapa, queijo americano e molho da casa.',
    preco: 26.0,
    categoria: 'Hambúrgueres',
    // Sem ponto da carne (smash é sempre bem passado por padrão)
  },

  // --- 3. COMBOS & OFERTAS ---
  {
    nome: 'Trio Parada Dura',
    descricao: '1 Cheddar Melt + 1 Batata com Cheddar e Bacon + 1 Refri 500ml.',
    preco: 49.9,
    categoria: 'Combos & Ofertas',
  },
  {
    nome: 'Box da Galera',
    descricao:
      '4 Cheeseburgers simples + 4 Batatas P + 1 Refrigerante 2 Litros.',
    preco: 99.9,
    categoria: 'Combos & Ofertas',
  },

  // --- 4. LANCHES DE FRANGO ---
  {
    nome: 'Chicken Crispy',
    descricao:
      'Filé de peito de frango empanado super crocante, alface e maionese no pão com gergelim.',
    preco: 25.9,
    categoria: 'Lanches de Frango',
    personalizavel: true, // ADD: Molho extra
  },
  {
    nome: 'Nuggets (10 unidades)',
    descricao:
      'Pedaços de frango macios por dentro e crocantes por fora. Acompanha molho barbecue.',
    preco: 18.9,
    categoria: 'Lanches de Frango',
  },

  // --- 5. ACOMPANHAMENTOS ---
  {
    nome: 'Batata Frita (Grande)',
    descricao: 'Nossas batatas tradicionais, sequinhas e crocantes.',
    preco: 14.9,
    categoria: 'Acompanhamentos',
    personalizavel: true, // ADD: Molhos
  },
  {
    nome: 'Onion Rings',
    descricao: 'Anéis de cebola empanados e dourados. Porção com 12 unidades.',
    preco: 16.9,
    categoria: 'Acompanhamentos',
  },
  {
    nome: 'Batata Rústica',
    descricao:
      'Batatas cortadas em gomos com casca, temperadas com alecrim e páprica.',
    preco: 18.9,
    categoria: 'Acompanhamentos',
  },

  // --- 6. VEGETARIANOS & LEVES ---
  {
    nome: 'Veggie Burger',
    descricao:
      'Hambúrguer de grão de bico e cogumelos, rúcula, tomate seco e maionese vegana.',
    preco: 31.0,
    categoria: 'Vegetarianos & Leves',
  },
  {
    nome: 'Wrap de Frango Grelhado',
    descricao:
      'Tortilha leve, tiras de frango grelhado, mix de folhas e molho de iogurte.',
    preco: 22.9,
    categoria: 'Vegetarianos & Leves',
  },

  // --- 7. BEBIDAS ---
  {
    nome: 'Coca-Cola Lata 350ml',
    descricao: 'Sabor original.',
    preco: 6.0,
    categoria: 'Bebidas',
  },
  {
    nome: 'Guaraná Antarctica 350ml',
    descricao: 'O original do Brasil.',
    preco: 6.0,
    categoria: 'Bebidas',
  },
  {
    nome: 'Suco de Laranja Natural (500ml)',
    descricao: 'Feito na hora, sem adição de açúcar.',
    preco: 12.0,
    categoria: 'Bebidas',
  },
  {
    nome: 'Água Mineral sem Gás',
    descricao: 'Garrafa 500ml.',
    preco: 4.0,
    categoria: 'Bebidas',
  },

  // --- 8. SOBREMESAS & SHAKES ---
  {
    nome: 'Milkshake de Morango',
    descricao:
      'Clássico e cremoso, feito com sorvete de morango e calda da fruta.',
    preco: 18.9,
    categoria: 'Sobremesas & Shakes',
    personalizavel: true, // ADD: Chantilly
  },
  {
    nome: 'Sundae de Chocolate',
    descricao:
      'Sorvete de baunilha com muita calda quente de chocolate e amendoim.',
    preco: 14.5,
    categoria: 'Sobremesas & Shakes',
  },
  {
    nome: 'Torta de Limão',
    descricao: 'Fatia de torta com massa crocante e merengue maçaricado.',
    preco: 12.9,
    categoria: 'Sobremesas & Shakes',
  },

  // --- 9. MENU KIDS ---
  {
    nome: 'Cheeseburger Kids',
    descricao: 'Pão, carne e queijo. Simples e delicioso para os pequenos.',
    preco: 19.9,
    categoria: 'Menu Kids',
  },
  {
    nome: 'Combo Aventurinha',
    descricao:
      '4 Nuggets, Batata Sorriso e um Suco de Caixinha + Brinde Surpresa.',
    preco: 28.9,
    categoria: 'Menu Kids',
  },
];

// Tabela de preços dos modificadores
const PRECOS_MODIFICADORES = {
  'Bacon Extra': 4.0,
  'Queijo Extra': 3.5,
  Ovo: 2.0,
  'Maionese Extra': 3.0,
  'Chantilly Extra': 4.5,
  'Calda de Chocolate': 3.0,
  'Molho Cheddar': 5.0,
  'Molho Barbecue': 3.0,
  'Molho Especial': 3.0,
};

async function main() {
  console.log('🌱 Iniciando o seeding...');

  // 1. Limpar dados antigos
  // Tabelas de relação N:N e itens
  await prisma.itemCarrinhoModificadores.deleteMany();
  await prisma.itemPedidoModificadores.deleteMany();

  // Itens
  await prisma.itemCarrinho.deleteMany();
  await prisma.itemPedido.deleteMany();

  // Tabelas intermediárias de produto/loja
  await prisma.produtosEmLoja.deleteMany();
  await prisma.modificadorEmLoja.deleteMany();
  await prisma.modificador.deleteMany();
  await prisma.personalizavel.deleteMany();

  // Containers principais
  await prisma.carrinho.deleteMany();
  await prisma.pedido.deleteMany();

  // Auth e Usuário
  await prisma.authRefreshToken.deleteMany();
  await prisma.authToken.deleteMany();
  await prisma.relatorioUsuario.deleteMany();
  await prisma.cupomDesconto.deleteMany();
  await prisma.telefone.deleteMany();
  await prisma.usuario.deleteMany();

  // Catálogo e Estrutura
  await prisma.produto.deleteMany();
  await prisma.categoriaProduto.deleteMany();
  await prisma.loja.deleteMany();
  await prisma.endereco.deleteMany();

  console.log('🧹 Banco de dados limpo.');

  // 2. Criar a Loja Principal
  const enderecoLoja = await prisma.endereco.create({
    data: {
      cep: '70857-530',
      estado: 'DF',
      cidade: 'Brasília',
      bairro: 'Asa Norte',
      logradouro: 'CLN 408/409',
      numero: '15',
      latitude: -15.759525,
      longitude: -47.87919,
    },
  });

  const loja = await prisma.loja.create({
    data: {
      nome: 'Sabor na Nuvem',
      cnpj: '12345678000199',
      horarioFuncionamento: '10:00 - 22:00',
      ofereceDelivery: true,
      raioEntregaKm: 15.0,
      enderecoId: enderecoLoja.id,
    },
  });

  console.log(`🏪 Loja criada: ${loja.nome} (ID: ${loja.id})`);

  // 3. Criar Categorias
  const categoriasCriadas = await Promise.all(
    categoriasData.map((catData) =>
      prisma.categoriaProduto.create({
        data: { nome: catData.nome, descricao: catData.descricao },
      }),
    ),
  );

  const mapaCategorias = {};
  categoriasCriadas.forEach((cat) => {
    mapaCategorias[cat.nome] = cat.id;
  });

  console.log(`📂 ${Object.keys(mapaCategorias).length} Categorias criadas.`);

  // 4. Criar Produtos
  await Promise.all(
    produtosSeed.map(async (p) => {
      const categoriaId = mapaCategorias[p.categoria];

      if (!categoriaId) {
        console.warn(`⚠️ Categoria não encontrada para: ${p.nome}`);
        return;
      }

      const dadosProduto = {
        nome: p.nome,
        descricao: p.descricao,
        imagemUrl: p.imagemUrl || null,
        categoriaId,
        lojasQueVendem: {
          create: {
            lojaId: loja.id,
            valorBase: p.preco,
            disponivel: true,
            emPromocao: false,
          },
        },
      };

      // Lógica dinâmica de personalização
      if (p.personalizavel) {
        let gruposPersonalizacao = [];

        // Personalização para Hambúrgueres (inclui Mega Bacon e Cheddar Melt)
        if (
          p.categoria === 'Hambúrgueres' ||
          p.nome.includes('Bacon Supreme') ||
          p.nome.includes('Cheddar Melt')
        ) {
          gruposPersonalizacao = [
            {
              nome: 'Ponto da Carne',
              selecaoMinima: 1,
              selecaoMaxima: 1,
              modificadores: {
                create: [
                  {
                    nome: 'Ao Ponto',
                    ordemVisualizacao: 1,
                    isOpcaoPadrao: true,
                  },
                  {
                    nome: 'Bem Passado',
                    ordemVisualizacao: 2,
                    isOpcaoPadrao: false,
                  },
                  {
                    nome: 'Mal Passado',
                    ordemVisualizacao: 3,
                    isOpcaoPadrao: false,
                  },
                ],
              },
            },
            {
              nome: 'Turbine seu Lanche',
              selecaoMinima: 0,
              selecaoMaxima: 3,
              modificadores: {
                create: [
                  { nome: 'Bacon Extra', ordemVisualizacao: 1 },
                  { nome: 'Queijo Extra', ordemVisualizacao: 2 },
                  { nome: 'Ovo', ordemVisualizacao: 3 },
                  { nome: 'Maionese Extra', ordemVisualizacao: 4 },
                ],
              },
            },
          ];
        }

        // Personalização para Shakes
        if (
          p.categoria === 'Sobremesas & Shakes' ||
          p.nome.includes('Milkshake')
        ) {
          gruposPersonalizacao = [
            {
              nome: 'Adicionais',
              selecaoMinima: 0,
              selecaoMaxima: 2,
              modificadores: {
                create: [
                  { nome: 'Chantilly Extra', ordemVisualizacao: 1 },
                  { nome: 'Calda de Chocolate', ordemVisualizacao: 2 },
                ],
              },
            },
          ];
        }

        // Personalização para Batatas
        if (p.nome.includes('Batata')) {
          gruposPersonalizacao = [
            {
              nome: 'Molhos',
              selecaoMinima: 0,
              selecaoMaxima: 2,
              modificadores: {
                create: [
                  { nome: 'Molho Cheddar', ordemVisualizacao: 1 },
                  { nome: 'Molho Barbecue', ordemVisualizacao: 2 },
                  { nome: 'Maionese Extra', ordemVisualizacao: 3 },
                ],
              },
            },
          ];
        }

        // Personalização para Frango
        if (p.categoria === 'Lanches de Frango') {
          gruposPersonalizacao = [
            {
              nome: 'Molho',
              selecaoMinima: 0,
              selecaoMaxima: 1,
              modificadores: {
                create: [
                  { nome: 'Molho Especial', ordemVisualizacao: 1 },
                  { nome: 'Molho Barbecue', ordemVisualizacao: 2 },
                ],
              },
            },
          ];
        }

        if (gruposPersonalizacao.length > 0) {
          dadosProduto.personalizacao = {
            create: gruposPersonalizacao,
          };

          const prodCriado = await prisma.produto.create({
            data: dadosProduto,
            include: { personalizacao: { include: { modificadores: true } } },
          });

          // Vincula modificadores à loja com preços
          await Promise.all(
            prodCriado.personalizacao.flatMap((grupo) =>
              grupo.modificadores.map((mod) => {
                const precoExtra = PRECOS_MODIFICADORES[mod.nome] || 0.0;

                return prisma.modificadorEmLoja.create({
                  data: {
                    lojaId: loja.id,
                    modificadorId: mod.id,
                    disponivel: true,
                    valorAdicional: precoExtra,
                  },
                });
              }),
            ),
          );
        } else {
          // Fallback caso a lógica acima não pegue (cria simples)
          await prisma.produto.create({ data: dadosProduto });
        }
      } else {
        // Cria produto simples (sem personalização)
        await prisma.produto.create({ data: dadosProduto });
      }
    }),
  );

  console.log(
    `🍔 ${produtosSeed.length} Produtos criados e vinculados à loja.`,
  );
  console.log('✅ Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
