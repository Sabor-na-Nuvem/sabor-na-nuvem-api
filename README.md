# Sabor na Nuvem - API White Label para Redes de Fast Food

> ⚠️ **Aviso de Propriedade Intelectual**
>
> Este é um projeto de código-fonte fechado desenvolvido para fins de portfólio. O código está disponível publicamente para demonstrar minhas habilidades técnicas e arquiteturais. A licença deste repositório **não permite** o uso, cópia, modificação ou distribuição do código para fins comerciais. Por favor, consulte o arquivo `LICENSE` para mais detalhes.

## 📄 Sobre o projeto

**Sabor na Nuvem** é uma plataforma white label projetada para atender às necessidades de redes de fast food. A solução permite que diferentes marcas personalizem e gerenciem suas operações de venda, incluindo cardápios, lojas, pedidos e clientes, tudo através de uma infraestrutura centralizada e robusta.

Este repositório contém o código-fonte da API. Ele segue uma arquitetura modular baseada em funcionalidades, onde todo o código relacionado a uma entidade de negócio (como `Usuario` ou `Produto`) é agrupado em sua própria pasta. Essa decisão foi feita para fins de escalabilidade e organização.

## 🛠️ Tecnologias utilizadas

- **Backend:** Node.js

- **Framework:** Express.js

- **Banco de Dados:** PostgreSQL

- **ORM:** Prisma

- **Containerização:** Docker & Docker Compose

- **Gerenciamento de Pacotes:** GitHub Packages (para pacotes privados)

- **Testes:** Jest (Testes de unidade & integração), Supertest (Testes de API HTTP)

## ⚙️ Como rodar o ambiente de desenvolvimento

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento localmente.

### Pré-requisitos

- Node.js (v20.x ou superior)

- Docker e Docker compose

- Git

- **Um [Personal Access Token (Classic)](https://github.com/settings/tokens/new?scopes=read:packages) do GitHub** com o escopo `read:packages` para baixar dependências privadas.

### Passo a passo

1. **Realize o clone do projeto e entre na pasta criada**

   ```bash
   git clone [https://github.com/Sabor-na-Nuvem/sabor-na-nuvem-api.git](https://github.com/Sabor-na-Nuvem/sabor-na-nuvem-api.git)
   cd sabor-na-nuvem-api
   ```

2. **Crie e configure o seu `.env` seguindo o padrão mostrado em `.env.example`**

   ```bash
   cp .env.example .env
   ```

3. **Configure a autenticação do GitHub Packages**

   > [!IMPORTANT]
   > Este projeto depende de um pacote NPM privado (`@joaoschmitz/express-prisma-auth`) hospedado no GitHub Packages. Para que o `npm install` (localmente ou no Docker) possa baixá-lo, você precisa se autenticar.
   1. **Crie um arquivo `.npmrc`** na raiz do projeto (este arquivo já está no `.gitignore`).
   2. **Adicione o seguinte conteúdo** a este arquivo, substituindo `SEU_TOKEN_PESSOAL` pelo Token de Acesso Pessoal (PAT) que você gerou nos pré-requisitos:

   ```.npmrc
   @joaoschmitz:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=SEU_TOKEN_PESSOAL
   ```

4. Construa as imagens e inicie os containers:

   ```bash
   docker compose up --build
   ```

   > **Nota:** O `docker-compose.yml` está configurado para usar o seu arquivo `.npmrc` local como um "segredo" (secret) durante o build, garantindo que seu token seja usado com segurança sem ser salvo na imagem do Docker.

5. Execute as migrações do banco de dados:

   ```bash
   docker compose exec api npx prisma migrate dev --name init
   ```

Pronto! Sua API está rodando e acessível em `http://localhost:3000`

### Swagger

Para este projeto, as rotas foram documentadas através do **Swagger**. A documentação se torna disponível para acesso em `http://localhost:3000/api-docs` após colocar o projeto para rodar (veja o passo a passo da seção anterior).

#### Testando Rotas Protegidas (com Autenticação)

Como a maioria das rotas da API é protegida, você precisará de um `accessToken` (Bearer Token) para testá-las. Siga este fluxo dentro da própria interface do Swagger:

1.  **Registre um Usuário:**
    - Vá até a seção `Auth` e encontre a rota `POST /api/auth/register`.
    - Clique em "Try it out" e preencha o JSON com um email e senha de teste.
    - Clique em "Execute".

2.  **Verifique seu Email (no Console):**
    - Como estamos em desenvolvimento, o serviço de email está mockado para imprimir no console.
    - Vá até o terminal onde seu `docker compose` está rodando.
    - Você verá um log: `[MOCK EMAIL] Para: seu@email.com | Verifique em: http://localhost:3000/api/auth/verify-email?token=...`
    - Copie o token (a string longa depois de `?token=`).

3.  **Execute a Verificação:**
    - Volte ao Swagger e encontre a rota `GET /api/auth/verify-email`.
    - Clique em "Try it out", cole o `token` que você copiou no campo "token" e clique em "Execute".
    - Ele irá redirecionar para uma URL de sucesso (ex: `.../login?message=email-verificado`).

> [!WARNING]
> **Comportamento Esperado:** O Swagger irá mostrar um erro `Undocumented / Failed to fetch / CORS`. **Isso é normal.**
>
> **Por quê?** O servidor está (corretamente) tentando redirecionar seu navegador para a URL de frontend (`http://localhost:3001/...`), mas o navegador bloqueia esse redirecionamento entre origens diferentes (CORS).
>
> **Como verificar se funcionou:** Embora o Swagger mostre um erro, é possível ver se a operação teve ou não sucesso ao olhar no seu console onde o Docker está rodando. Se funcionou, você deve ver um log parecido com esse: `prisma:query UPDATE "public"."usuario" SET "emailVerificado" = $1, ...`.
>
> **Alternativa:** Para verificar o email, **copie o link de verificação completo** do console do Docker e **cole-o diretamente na barra de endereço do seu navegador**. Se funcionou, você deverá ser redirecionado para uma página inexistente com a URL apontando se funcionou (`.../login?message=email-verificado`).

4.  **Faça o Login para Obter o Token:**
    - Vá para a rota `POST /api/auth/login`.
    - Clique em "Try it out" e preencha com o email e senha que você acabou de registrar.
    - Execute. A resposta `Response body` será:
      ```json
      {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6..."
      }
      ```
    - **Copie o `accessToken` completo.**

5.  **Autorize o Swagger:**
    - No topo da página do Swagger, clique no botão verde **"Authorize"** (com um ícone de cadeado).
    - Um modal "Available authorizations" aparecerá.
    - No campo "value" da seção `bearerAuth`, cole **apenas o token** (a string `ey...`). O Swagger adicionará o prefixo `Bearer ` automaticamente.
    - Clique em "Authorize" e depois em "Close".

Os cadeados em todas as rotas protegidas agora devem aparecer como "fechados". Você está autenticado e pode testar qualquer rota da API que o cargo do seu usuário tem acesso (como `GET /api/pedidos/me` ou `POST /api/usuarios/me/carrinho/itens`).

## 🧪 Rodando os Testes

Este projeto é configurado com dois tipos de testes: Testes de Unidade e Testes de Integração.

### Testes de Unidade

Testes rápidos que validam a lógica de negócio de forma isolada (serviços, helpers) com dependências (como o banco de dados) mockadas.

```bash
# Para rodar todos os testes de unidade
npm run test:unit

# Para rodar em modo 'watch' (monitora mudanças)
npm run test:watch
```

> 📝 Nota: Os testes de unidade são executados automaticamente toda vez que o container `api` é iniciado, como pode ser visto no `entrypoint.sh`.

### Testes de Integração

Testes mais completos que simulam requisições HTTP reais (usando Supertest) e executam o fluxo completo (controller -> serviço -> banco de dados) contra um banco de dados de teste real.

#### Requisitos para rodar os testes de integração

1.  **Autenticação do NPM:** Você deve ter concluído a **Etapa 3** (criação do `.npmrc`) da seção de desenvolvimento.
2.  **Docker em Execução:** O ambiente Docker deve estar em execução (`docker compose up -d`).
3.  **Arquivo `.env.test`:** Você deve ter um arquivo `.env.test` na raiz do projeto. Siga o `.env.example`, mas certifique-se de que `POSTGRES_DB=sabor_na_nuvem_test` e a `DATABASE_URL` aponte para `localhost` e para o banco de teste.
4.  **Criar Banco de Teste:** Você deve criar o banco de dados de teste no container do PostreSQL (este é um passo único):

    ```bash
    # Substitua SEU_USUARIO_POSTGRES pelo seu POSTGRES_USER do .env
    docker compose exec db psql -U SEU_USUARIO_POSTGRES -c "CREATE DATABASE sabor_na_nuvem_test;"
    ```

#### Executando os testes de integração

Uma vez que o ambiente Docker e o banco de teste estejam prontos, rode o comando a partir da sua máquina local (host):

```bash
npm run test:integration
```

> 📝 Nota: O script de teste irá se conectar ao `sabor_na_nuvem_test`, aplicar todas as migrações (via `prisma migrate deploy`) e limpar todas as tabelas após cada teste para garantir o isolamento.

## 📄 Licença

© 2025 [João Matheus de Oliveira Schmitz]. Todos os direitos reservados.
