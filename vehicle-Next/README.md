# 🚗 Vehicle Finance API

API para controle de compra, despesas e venda de veículos.

Desenvolvido com:

- Next.js (App Router)
- Prisma ORM
- PostgreSQL (Neon)
- Autenticação com token

---

## 📦 Tecnologias

- Next.js
- Prisma
- PostgreSQL
- Node.js

---

## ⚙️ Configuração do projeto

### 1. Clone o repositório

````bash
git clone <SEU_REPO>
cd vehicle-finance

# 🚗 Vehicle Finance API

API para controle de compra, despesas e venda de veículos.

Desenvolvido com:
- Next.js (App Router)
- Prisma ORM
- PostgreSQL (Neon)
- Autenticação com token

---

## 📦 Tecnologias

- Next.js
- Prisma
- PostgreSQL
- Node.js

---

## ⚙️ Configuração do projeto

### 1. Clone o repositório

```bash
git clone <SEU_REPO>
cd vehicle-finance

npm install

Configure o .env

Crie um arquivo .env:

DATABASE_URL="sua_url_postgres"

Rode o Prisma
npx prisma generate
npx prisma db push

Rode o projeto
npm run dev

Servidor disponível em:

http://localhost:3000
🔐 Autenticação

A API utiliza token via header:

Authorization: Bearer SEU_TOKEN
📌 Rotas principais
Auth
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
Veículos
GET /api/vehicles
POST /api/vehicles
GET /api/vehicles/:id
PUT /api/vehicles/:id
DELETE /api/vehicles/:id
Despesas
POST /api/expenses

🧠 Observações
Cada usuário possui seus próprios veículos
Dados são isolados por autenticação
Banco utilizado: PostgreSQL (Neon)
````
