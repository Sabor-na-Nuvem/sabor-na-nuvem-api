# Sabor na Nuvem - API White Label para Redes de Fast Food

> ⚠️ **Aviso de Propriedade Intelectual**
>
> Este é um projeto de código-fonte fechado desenvolvido para fins de portfólio. O código está disponível publicamente para demonstrar minhas habilidades técnicas e arquiteturais. A licença deste repositório **não permite** o uso, cópia, modificação ou distribuição do código para fins comerciais. Por favor, consulte o arquivo `LICENSE` para mais detalhes.

## 📄 Sobre o projeto
**Sabor na Nuvem** é uma plataforma white label projetada para atender às necessidades de redes de fast food. A solução permite que diferentes marcas personalizem e gerenciem suas operações de venda, incluindo cardápios, lojas, pedidos e clientes, tudo através de uma infraestrutura centralizada e robusta.

Este repositório contém o código-fonte da API. Ele segue uma arquitetura modular baseada em funcionalidades, onde todo o código relacionado a uma entidade de negócio (como `Usuario` ou `Produto`) é agrupado em sua própria pasta. Essa decisão foi feita para fins de escalabilidade e organização.

## 🛠️ Tecnologias utilizadas
- **Backend:** Node.js

- **Framework:** Express.js (implícito)

- **Banco de Dados:** PostgreSQL

- **ORM:** Prisma

- **Containerização:** Docker & Docker Compose

## ⚙️ Como rodar o ambiente de desenvolvimento

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento localmente.

### Pré-requisitos
- Node.js (v20.x ou superior)

- Docker e Docker compose

- Git

### Passo a passo

1. Realize o clone do projeto e entre na pasta criada
```bash
git clone https://github.com/Sabor-na-Nuvem/sabor-na-nuvem-api.git
cd sabor-na-nuvem-api
```

2. Crie e configure o seu `.env` seguindo o padrão mostrado em `.env.example`
```bash
cp .env.example .env
```

3. Construa as imagens e inicie os containers:
```bash
docker compose up --build
```

4. Execute as migrações do banco de dados:
```bash
docker compose exec api npx prisma migrate dev --name init
```

Pronto! Sua API está rodando e acessível em `http://localhost:3000`

### Swagger

Para este projeto, as rotas foram documentadas através do **Swagger**. A documentação se torna disponível para acesso em `http://localhost:3000/api-docs`, após colocar o projeto para rodar (veja o passo a passo da seção anterior).

## 📄 Licença

© 2025 [João Matheus de Oliveira Schmitz]. Todos os direitos reservados.
