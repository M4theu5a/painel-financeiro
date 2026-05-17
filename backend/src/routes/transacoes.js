const router = require('express').Router();
const db = require('../database');
const { autenticar } = require('../middlewares');

// Listar transações ativas do mês
router.get('/', autenticar, async (req, res) => {
  const { mes, ano } = req.query;
  const result = await db.query(
    `SELECT * FROM transacoes
     WHERE usuario_id = $1
       AND EXTRACT(MONTH FROM data) = $2
       AND EXTRACT(YEAR FROM data) = $3
       AND (excluido = false OR excluido IS NULL)
     ORDER BY data DESC`,
    [req.usuario.id, mes, ano]
  );
  res.json(result.rows);
});

// Listar transações excluídas do mês
router.get('/excluidos', autenticar, async (req, res) => {
  const { mes, ano } = req.query;
  const result = await db.query(
    `SELECT * FROM transacoes
     WHERE usuario_id = $1
       AND EXTRACT(MONTH FROM data) = $2
       AND EXTRACT(YEAR FROM data) = $3
       AND excluido = true
     ORDER BY excluido_em DESC`,
    [req.usuario.id, mes, ano]
  );
  res.json(result.rows);
});

// Resumo do mês (apenas transações ativas)
router.get('/resumo', autenticar, async (req, res) => {
  const { mes, ano } = req.query;
  const result = await db.query(
    `SELECT
       COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) AS receitas,
       COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) AS despesas
     FROM transacoes
     WHERE usuario_id = $1
       AND EXTRACT(MONTH FROM data) = $2
       AND EXTRACT(YEAR FROM data) = $3
       AND (excluido = false OR excluido IS NULL)`,
    [req.usuario.id, mes, ano]
  );
  const { receitas, despesas } = result.rows[0];
  res.json({ receitas, despesas, saldo: receitas - despesas });
});

// Adicionar transação
router.post('/', autenticar, async (req, res) => {
  const { tipo, categoria, valor, descricao, data } = req.body;
  const result = await db.query(
    `INSERT INTO transacoes (usuario_id, tipo, categoria, valor, descricao, data, excluido)
     VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *`,
    [req.usuario.id, tipo, categoria, valor, descricao, data]
  );
  res.status(201).json(result.rows[0]);
});

// Soft delete (mover para excluídos)
router.delete('/:id', autenticar, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE transacoes
       SET excluido = true, excluido_em = NOW()
       WHERE id = $1 AND usuario_id = $2
       RETURNING *`,
      [req.params.id, req.usuario.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Transação não encontrada' });
    }
    res.json({ mensagem: 'Movida para excluídos' });
  } catch (err) {
    console.error('Erro no DELETE:', err);
    res.status(500).json({ erro: err.message });
  }
});

// Restaurar transação excluída
router.patch('/:id/restaurar', autenticar, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE transacoes
       SET excluido = false, excluido_em = NULL
       WHERE id = $1 AND usuario_id = $2
       RETURNING *`,
      [req.params.id, req.usuario.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Transação não encontrada' });
    }
    res.json({ mensagem: 'Transação restaurada' });
  } catch (err) {
    console.error('Erro no RESTORE:', err);
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
