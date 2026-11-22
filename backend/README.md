# Backend — GeraçãoTech Fullstack

API REST desenvolvida com Node.js, Express, Sequelize e MySQL.

## Pré-requisitos

- Node.js 18+
- npm
- **MySQL** instalado e rodando localmente

## Configuração

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e edite com as credenciais do seu MySQL local:

```bash
# Windows
copy .env.example .env

# Linux / Mac
cp .env.example .env
```

Conteúdo do `.env.example`:

```env
DB_NAME=geracaotech
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
PORT=3000
JWT_SECRET=configure-uma-chave-segura
FRONTEND_ORIGIN=http://localhost:5173
```

> Ajuste `DB_USER`, `DB_PASSWORD` e demais campos conforme o seu ambiente MySQL.

**Gerar um valor seguro para `JWT_SECRET`:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copie o valor gerado e cole no `.env`:

```env
JWT_SECRET=cole_aqui_o_valor_gerado
```

### 3. Criar o banco de dados

Acesse o MySQL e execute:

```sql
CREATE DATABASE geracaotech;
```

> O nome deve ser igual ao valor de `DB_NAME` no seu `.env`.

### 4. Criar as tabelas

```bash
npm run db:sync
```

> ⚠️ Este comando executa `sequelize.sync({ force: true })`, que **apaga e recria todas as tabelas**. Execute apenas uma vez na configuração inicial.

### 5. Popular com dados de exemplo

```bash
npm run db:seed
```

Isso cria categorias, produtos e um usuário padrão:

| Campo | Valor |
|-------|-------|
| E-mail | `admin@email.com` |
| Senha | `password123` |

### 6. Iniciar o servidor

```bash
npm run dev   # desenvolvimento (auto-restart com nodemon)
# ou
npm start     # produção
```

Servidor disponível em: `http://localhost:3000`

## Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento com nodemon |
| `npm start` | Inicia o servidor em modo produção |
| `npm run db:sync` | Cria/recria as tabelas no banco (⚠️ apaga dados existentes) |
| `npm run db:seed` | Popula o banco com categorias, produtos e usuário padrão |
| `npm test` | Executa os testes (Jest) — não requer MySQL |

## Endpoints

### Produtos — `/v1/product`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/v1/product/search` | Não | Listar produtos com filtros |
| GET | `/v1/product/:id` | Não | Buscar produto por ID |
| POST | `/v1/product` | Sim | Criar produto |
| PUT | `/v1/product/:id` | Sim | Atualizar produto |
| DELETE | `/v1/product/:id` | Sim | Deletar produto |

### Categorias — `/v1/category`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/v1/category/search` | Não | Listar categorias |
| GET | `/v1/category/:id` | Não | Buscar categoria por ID |
| POST | `/v1/category` | Sim | Criar categoria |
| PUT | `/v1/category/:id` | Sim | Atualizar categoria |
| DELETE | `/v1/category/:id` | Sim | Deletar categoria |

### Usuários — `/v1/user`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/v1/user` | Não | Criar usuário |
| POST | `/v1/user/token` | Não | Gerar token JWT |
| GET | `/v1/user/:id` | Não | Buscar usuário por ID |
| PUT | `/v1/user/:id` | Sim | Atualizar usuário |
| DELETE | `/v1/user/:id` | Sim | Deletar usuário |

> **Auth = Sim:** rotas protegidas exigem um token JWT no header da requisição. Veja como obter e usar o token na seção abaixo.

## Autenticação

### 1. Gerar o token

Faça uma requisição `POST /v1/user/token` com as credenciais no body:

```json
POST http://localhost:3000/v1/user/token
Content-Type: application/json

{
  "email": "admin@email.com",
  "password": "password123"
}
```

Resposta:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Usar o token nas rotas protegidas

Inclua o token no header de todas as requisições que exigem autenticação:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testes

```bash
npm test
```

75 testes distribuídos em 8 suites. Os testes utilizam SQLite em memória — **não é necessário ter o MySQL rodando** para executá-los.
