# Financiária - Backend ⚙️

Este é o backend da plataforma Financiária. Ele é uma API RESTful construída em Node.js com o framework Express, responsável por toda a lógica de negócio, persistência de dados no PostgreSQL e segurança via JWT.

## 🗂️ Arquitetura e Código

A arquitetura foi pensada para ser limpa e direta. O código principal vive dentro da pasta `src/`.

### 1. Inicialização (`src/app.js`)
O coração do servidor. 
- Ele importa o `express` e cria a aplicação.
- Habilita o `cors` (para permitir que o Frontend no `localhost:5173` converse com o Backend no `localhost:3001`).
- Permite que o Node entenda requisições JSON (`app.use(express.json())`).
- Associa os controladores de rotas aos caminhos `/auth` e `/transacoes`.
- Por fim, escuta a porta definida no `.env`.

### 2. Conexão com o Banco (`src/database.js`)
A persistência de dados é feita no PostgreSQL usando o pacote `pg`.
- Usamos o `Pool`, que gerencia múltiplas conexões com o banco de dados de maneira eficiente e otimizada (não sobrecarregando o servidor com abre/fecha de conexões).
- Ele lê as credenciais automaticamente pelo `process.env`.

### 3. Segurança e Autenticação (`src/middlewares.js` e `src/routes/auth.js`)
A segurança é garantida usando **JSON Web Tokens (JWT)**.

- **Rotas de Auth (`auth.js`)**: 
  - Na rota `/cadastrar`, o `bcrypt` pega a senha original digitada pelo usuário e transforma em um *hash* irreversível (`bcrypt.hash(senha, 10)`). Apenas o hash é salvo no banco, nunca a senha pura.
  - Na rota `/login`, buscamos o usuário pelo e-mail e usamos o `bcrypt.compare` para ver se a senha bate com o hash. Se bater, o `jwt.sign` gera um token criptografado com o ID e o Nome do usuário, válido por 7 dias.

- **Middleware (`middlewares.js`)**:
  - Toda vez que uma requisição vai para uma rota protegida (como as de transações), ela passa por esse arquivo.
  - Ele lê o cabeçalho `Authorization: Bearer <TOKEN>`, extrai o token e verifica se ele foi assinado com nossa chave secreta (`JWT_SECRET`).
  - Se for válido, decodifica o ID do usuário e repassa para a rota original (`req.usuario`).

### 4. Gestão Financeira (`src/routes/transacoes.js`)
Este arquivo resolve a lógica dos saldos e do histórico.
- Possui o CRUD de criar e deletar.
- **Destaque:** As rotas GET (Listar e Resumo) utilizam filtros direto pelo banco de dados através da query `EXTRACT(MONTH FROM data) = $2`. Isso significa que é o PostgreSQL quem faz o trabalho duro de filtrar apenas o mês correto e fazer a soma dos valores usando a função condicional `SUM(CASE WHEN...)`, tornando nossa aplicação extremamente leve e rápida.

---

## 🚀 Como Rodar

Para executar o backend de forma isolada, garanta que suas variáveis de ambiente (`.env`) estejam corretas e rode:

```bash
npm install
npm run dev
```

*(Lembre-se que o banco de dados PostgreSQL deve estar rodando e configurado)*
