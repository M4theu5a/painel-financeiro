const router = require('express').Router();
const db = require('../database');
const { autenticar } = require('../middlewares');

// Listar transações do mês
router.get('/', autenticar, async (req, res) => {
  const { mes, ano } = req.query;
  const result = await db.query(
    `SELECT * FROM transacoes
     WHERE usuario_id = $1
       AND EXTRACT(MONTH FROM data) = $2
       AND EXTRACT(YEAR FROM data) = $3
     ORDER BY data DESC`,
    [req.usuario.id, mes, ano]
  );
  res.json(result.rows);
});

// Resumo do mês (receitas, despesas, saldo)
router.get('/resumo', autenticar, async (req, res) => {
  const { mes, ano } = req.query;
  const result = await db.query(
    `SELECT
       COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) AS receitas,
       COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) AS despesas
     FROM transacoes
     WHERE usuario_id = $1
       AND EXTRACT(MONTH FROM data) = $2
       AND EXTRACT(YEAR FROM data) = $3`,
    [req.usuario.id, mes, ano]
  );
  const { receitas, despesas } = result.rows[0];
  res.json({ receitas, despesas, saldo: receitas - despesas });
});

// Adicionar transação
router.post('/', autenticar, async (req, res) => {
  const { tipo, categoria, valor, descricao, data } = req.body;
  const result = await db.query(
    `INSERT INTO transacoes (usuario_id, tipo, categoria, valor, descricao, data)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [req.usuario.id, tipo, categoria, valor, descricao, data]
  );
  res.status(201).json(result.rows[0]);
});

// Deletar transação
router.delete('/:id', autenticar, async (req, res) => {
  await db.query(
    'DELETE FROM transacoes WHERE id = $1 AND usuario_id = $2',
    [req.params.id, req.usuario.id]
  );
  res.json({ mensagem: 'Removida com sucesso' });
});

module.exports = router;
