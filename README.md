# Financiária 💰

A **Financiária** é uma plataforma web simples de controle financeiro projetada para universitários. O sistema permite cadastrar e gerenciar receitas e despesas com foco na clareza e controle do saldo mensal.

---

## 🛠️ Stack Tecnológico

O projeto foi dividido em duas partes independentes (Backend e Frontend), garantindo uma arquitetura moderna e escalável.

- **Backend:** Node.js, Express
- **Banco de Dados:** PostgreSQL (driver `pg`)
- **Autenticação:** JWT (JSON Web Tokens) e bcrypt (para hash de senhas)
- **Frontend:** React (inicializado com Vite), Axios, React Router

---

## 📂 Estrutura do Projeto

### Backend
Localizado na pasta `/backend`. 
Responsável por servir os dados, comunicar com o banco de dados e garantir a segurança das requisições via autenticação por Token.

- **`src/app.js`**: Ponto de entrada da aplicação. Inicia o servidor Express, configura os middlewares básicos (`cors`, `express.json`) e carrega as rotas.
- **`src/database.js`**: Gerencia a conexão (Pool) com o banco de dados PostgreSQL usando as credenciais do `.env`.
- **`src/middlewares.js`**: Contém o middleware `autenticar`. Ele intercepta requisições privadas, verificando a validade do Token JWT enviado pelo Frontend.
- **`src/routes/auth.js`**: Controla o Cadastro (`/cadastrar`) onde fazemos o *hash* da senha com `bcrypt`, e o Login (`/login`) responsável por retornar o token de sessão.
- **`src/routes/transacoes.js`**: Contém o CRUD (Create, Read, Update, Delete) principal e o resumo financeiro mensal.

### Frontend
Localizado na pasta `/frontend`.
Responsável pela interface do usuário e comunicação com a API.

- **`src/App.jsx`**: Gerencia as rotas da aplicação (`/login`, `/cadastro`, e `/` protegido para a Home).
- **`src/services/api.js`**: Configuração central do Axios. Possui um interceptor que adiciona o token JWT automaticamente no cabeçalho (Header) de todas as requisições.
- **`src/pages/Home.jsx`**: A tela principal da aplicação. Responsável por puxar o resumo mensal e as transações, além de processar as lógicas de adicionar e deletar gastos ou ganhos.
- **`src/pages/Login.jsx` & `src/pages/Cadastro.jsx`**: Telas de autenticação conectadas à API que salvam o token no `localStorage`.

---

## 🚀 Como Executar o Projeto

Siga os passos abaixo para testar o projeto localmente.

### 1. Configurar Banco de Dados
Tenha o PostgreSQL rodando em sua máquina e crie um banco de dados chamado `financiaria`.
Rode os seguintes scripts SQL na sua ferramenta de banco (ex: DBeaver ou pgAdmin):

```sql
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL
);

CREATE TABLE transacoes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(10) CHECK (tipo IN ('receita', 'despesa')) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  descricao TEXT,
  data DATE NOT NULL
);
```

### 2. Configurar Variáveis de Ambiente (Backend)
Dentro da pasta `backend`, crie ou verifique o arquivo `.env` para garantir que as credenciais do banco estão corretas (especialmente `DB_PASSWORD`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=financiaria
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=segredo123
PORT=3001
```

### 3. Rodando a Aplicação
Abra **dois terminais**, um para o backend e outro para o frontend.

**No terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```
> O servidor rodará na porta `3001`!

**No terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```
> O site ficará disponível em `http://localhost:5173/`!
