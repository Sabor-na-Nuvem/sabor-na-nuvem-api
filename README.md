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

---

## 🔗 Links de Acesso Rápido (Deploy)

A API do projeto está implantada no **Render** e acessível publicamente para testes e avaliação:

| Recurso | URL | Observação |
| :--- | :--- | :--- |
| **API Base URL** | `https://sabor-na-nuvem-api.onrender.com` | Servidor Node.js (Pode ter "cold start" inicial). |
| **Documentação (Swagger)** | `https://sabor-na-nuvem-api.onrender.com/api-docs` | Interface para testar todas as rotas da API. Para ver mais sobre como o Swagger funciona, veja a seção **Swagger**. |

---

## ☁️ Arquitetura de Deploy (Produção)

Este projeto segue uma arquitetura moderna e desagregada para máxima performance e custo-efetividade (Plano Gratuito), utilizando um modelo de **Continuous Deployment (CD)**.

| Componente | Plataforma | Finalidade | Status de Atividade |
| :--- | :--- | :--- | :--- |
| **Backend (API)** | **Render** | Serviço Node.js/Express. | Dorme após 15 min de inatividade (Plano Gratuito). |
| **Banco de Dados** | **Neon** | PostgreSQL geoespacial (PostGIS). | Sempre ativo e com conexões otimizadas. |
| **Frontend** | **Vercel** | Frontend React (SPA). | CDN global e rápido. |

### Fluxo de Continuous Deployment (CD)

O deploy é inteiramente controlado pelo **GitHub Actions** para garantir que a API só vá para produção se estiver estável. 

1.  **Push para `main`:** O commit aciona o workflow CI/CD no GitHub.
2.  **CI (Testes):** A pipeline roda testes unitários e de integração (usando um banco de teste em memória).
3.  **CD (Deploy):** Se todos os testes passarem, a pipeline dispara o **Render Deploy Hook** (via `curl`).
4.  **Build Final:** O Render faz o build do Node.js (`npm install && npx prisma generate`) e coloca a API no ar.

---

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
   git clone https://github.com/Sabor-na-Nuvem/sabor-na-nuvem-api.git
   cd sabor-na-nuvem-api
   ```

2. **Crie e configure o seu `.env`**

   Crie o arquivo `.env` a partir do exemplo:

   ```bash
   cp .env.example .env
   ```

3. **Configure a autenticação do GitHub Packages (Obrigatório)**

   Este projeto utiliza um pacote privado (`@joaoschmitz/express-prisma-auth`). Para que o Docker consiga baixá-lo, é necessário criar um arquivo de configuração com seu token de acesso.

   1. Gere um **Personal Access Token (Classic)** no GitHub [neste link](https://github.com/settings/tokens/new?scopes=read:packages) e marque o escopo `read:packages`.
   2. Na raiz do projeto, crie um arquivo chamado **`.npmrc.docker`**.
   3. Cole o conteúdo abaixo dentro dele, substituindo `SEU_TOKEN` pelo token que você gerou (começa com `ghp_...`):

   ```ini
   @joaoschmitz:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=ghp_SEU_TOKEN_AQUI_123456
   ```

   > [!WARNING]
   > **Não coloque seu token no arquivo `.npmrc` por engano**, ele é visível para todos no Github e deve ser mantido do modo que está.

4. **Construa as imagens e inicie os containers**

   Certifique-se de que seu `docker-compose.yml` esteja apontando para o arquivo `.npmrc.docker` na seção de secrets, e então rode:

   ```bash
   docker compose up --build
   ```

5. **Execute as migrações do banco de dados**

   ```bash
   docker compose exec api npx prisma migrate dev --name init
   ```

6. **(Opcional) Popular o banco de dados**

   ```bash
   docker compose exec api npx prisma db seed
   ```

   > Isso vai limpar o banco e criar dados base prontos para serem consumidos pelo frontend.

Pronto! Sua API está rodando e acessível em `http://localhost:3000`

### Swagger

Para este projeto, as rotas foram documentadas através do **Swagger**. A documentação se torna disponível para acesso em `http://localhost:3000/api-docs` após colocar o projeto para rodar (veja o passo a passo da seção anterior).

#### Testando Rotas Protegidas (com Autenticação)

Como a maioria das rotas da API é protegida, você precisará de um `accessToken` (Bearer Token) para testá-las. Siga este fluxo dentro da própria interface do Swagger:

1.  **Registre um Usuário:**
    - Vá até a seção `Auth` e encontre a rota `POST /api/auth/register`.
    - Clique em "Try it out" e preencha o JSON com um email e senha de teste.
    - Clique em "Execute".

    > [!WARNING]
    > O usuário criado tem o cargo **CLIENTE**. Para testar rotas de Admin, você precisará modificar o cargo diretamente no banco de dados (veja a seção **Gerenciando o Banco de Dados**).

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
> **Comportamento Esperado:** O servidor deve te redirecionar para a página de login do frontend, caso este esteja rodando.
>
> **Como verificar se funcionou:** Se o frontend não estiver rodando, é possível ver se a operação teve ou não sucesso ao olhar no seu console onde o Docker está rodando. Se funcionou, você deve ver um log parecido com esse: `prisma:query UPDATE "public"."usuario" SET "emailVerificado" = $1, ...`.
>
> **Alternativa:** Para verificar o email, **copie o link de verificação completo** do console do Docker e **cole-o diretamente na barra de endereço do seu navegador**. Se funcionou, você deverá ser redirecionado para o frontend.

1.  **Faça o Login para Obter o Token:**
    - Vá para a rota `POST /api/auth/login`.
    - Clique em "Try it out" e preencha com o email e senha que você acabou de registrar.
    - Execute. A resposta `Response body` será:
      ```json
      {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6..."
      }
      ```
    - **Copie o `accessToken` completo.**

2.  **Autorize o Swagger:**
    - No topo da página do Swagger, clique no botão verde **"Authorize"** (com um ícone de cadeado).
    - Um modal "Available authorizations" aparecerá.
    - No campo "value" da seção `bearerAuth`, cole **apenas o token** (a string `ey...`). O Swagger adicionará o prefixo `Bearer ` automaticamente.
    - Clique em "Authorize" e depois em "Close".

Os cadeados em todas as rotas protegidas agora devem aparecer como "fechados". Você está autenticado e pode testar qualquer rota da API que o cargo do seu usuário tem acesso (como `GET /api/pedidos/me` ou `POST /api/usuarios/me/carrinho/itens`).

---

## 🗄️ Gerenciando o Banco de Dados (Prisma Studio)

O Prisma Studio é uma interface gráfica (GUI) visual que permite explorar, visualizar e manipular os dados do seu banco PostgreSQL diretamente pelo navegador.

### Como acessar

Com o ambiente Docker rodando, execute o seguinte comando no terminal:

```bash
docker compose exec api npx prisma studio
```

O terminal ficará aguardando conexões. Abra seu navegador e acesse **[http://localhost:5555](http://localhost:5555)** para visualizar seus dados.

---

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

---

## 🚀 Manutenção do Banco em Produção (Neon)

A arquitetura de produção utiliza o **Neon** (Serverless Postgres) para o banco de dados e o **Render** para a API.

Para realizar manutenções no banco de produção (como rodar migrações ou popular dados iniciais) sem precisar acessar o servidor remoto, utilizamos o Docker localmente como um "executor", conectando-se remotamente ao Neon.

### Pré-requisitos de Produção

1.  **Arquivo de Configuração Seguro:**
    Crie um arquivo `.env.prod` na raiz do projeto (este arquivo é ignorado pelo Git).

    ```bash
    cp .env.prod.example .env.prod
    ```

2.  **Variáveis:**
    Adicione a variável `DATABASE_URL` fornecida pelo Neon neste arquivo:

    ```env
    # .env.prod
    DATABASE_URL="postgresql://user:pass@ep-xyz.aws.neon.tech/neondb?sslmode=require"
    ```

### Comandos de Manutenção

Com o arquivo configurado, utilize os comandos abaixo. Eles sobem um container temporário da API, executam o comando do Prisma apontando para a nuvem e se encerram automaticamente.

#### 1. Aplicar Migrações (Schema Update)
Atualiza a estrutura do banco de dados na Neon de acordo com seu `schema.prisma`.

```bash
ENV_FILE=.env.prod docker compose --env-file .env.prod run --rm--no-deps api npx prisma migrate deploy
```

#### 2. Popular o Banco (Seed)
Roda o script de seed para criar os dados iniciais (loja, produtos, etc.) no ambiente de produção.

```bash
ENV_FILE=.env.prod docker compose --env-file .env.prod run --rm --no-deps api npx prisma db seed
```

> **Nota:** A flag `--no-deps` garante que o Docker não suba o banco de dados local desnecessariamente, já que a conexão será feita via internet com o Neon.

--- 

## 📄 Licença

© 2025 [João Matheus de Oliveira Schmitz]. Todos os direitos reservados.
