# Financiária - Frontend 🎨

Este é o frontend da plataforma Financiária. Construído com **React** e gerenciado pelo **Vite**, o projeto foca em ter uma estrutura simplificada, utilizando Hooks do React e comunicação inteligente com a nossa API via Axios.

## 🗂️ Arquitetura e Código

O código está estruturado na pasta `src/` e é baseado na navegação (React Router) e em componentes de páginas completas.

### 1. Inicialização e Rotas (`src/App.jsx` e `src/main.jsx`)
O `App.jsx` dita as regras de navegação da nossa aplicação usando a biblioteca `react-router-dom`:
- Define o caminho `/login` para a tela de autenticação.
- Define o caminho `/cadastro` para a tela de registro de novos usuários.
- Define o caminho principal `/` para a `Home`, que abriga nosso Dashboard principal.
Caso o usuário acesse uma rota inexistente, o comando `Navigate to="/"` intercepta e o devolve para o início.

### 2. Comunicação via Axios (`src/services/api.js`)
Criamos uma instância padronizada do `axios` em vez de usar `fetch` nativo. 
- Ele já aponta por padrão para a base da URL do nosso backend (`http://localhost:3001`).
- O grande diferencial deste arquivo é o **Interceptor**. Ele age como um vigia: antes de qualquer requisição sair do Frontend, ele verifica se existe um token salvo no `localStorage`. Caso exista, ele "injeta" o token automaticamente no cabeçalho da requisição (`Authorization: Bearer ...`). Graças a isso, não precisamos ficar enviando o token manualmente em toda chamada da `Home`.

### 3. As Telas (`src/pages/`)
O núcleo do site mora nos três componentes de página:

- **`Login.jsx` e `Cadastro.jsx`**:
  - São controlados pelo estado (`useState`) para capturar os dados dos *inputs* (formulários controlados).
  - Ao fazer o submit no login com sucesso, ele extrai o `token` e o `nome` do usuário da resposta do Node.js, guarda-os no *Armazenamento Local* do Navegador (`localStorage.setItem(...)`) e redireciona o usuário (`navigate('/')`).

- **`Home.jsx`**:
  - O cérebro do frontend. Usa o `useEffect` de cara para proteger a tela: se não encontrar o token no *storage*, "expulsa" o usuário jogando ele de volta para a tela de login.
  - Sendo validado, usamos novamente o `useEffect` para carregar simultaneamente (com `Promise.all`) o resumo de valores e a lista de transações baseando-se no mês e ano selecionados nos filtros.
  - Ao deletar ou adicionar uma conta, a função chama novamente o servidor para atualizar os dados, causando uma re-renderização suave.

### 4. Estilos (CSS)
Para mantermos a lógica do React em evidência, usamos arquivos de CSS puros (como `Home.css` e `Login.css`), importando as classes dentro de cada componente diretamente. Mantivemos estilos globais mínimos (um *reset*) no `index.css`.

---

## 🚀 Como Rodar

Para executar o frontend de forma isolada, em modo de desenvolvimento ultrarrápido graças ao Vite, abra a pasta `frontend` no terminal e rode:

```bash
npm install
npm run dev
```

*(Lembre-se de que o Backend na porta 3001 precisa estar rodando para os dados aparecerem corretamente)*
