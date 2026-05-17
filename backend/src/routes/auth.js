const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');

// Cadastro
router.post('/cadastrar', async (req, res) => {
  const { nome, email, senha } = req.body;
  const senha_hash = await bcrypt.hash(senha, 10);

  try {
    const result = await db.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email, senha_hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro no cadastro:', err.message);
    if (err.code === '23505') {
      res.status(400).json({ erro: 'E-mail já cadastrado' });
    } else {
      res.status(500).json({ erro: 'Erro ao cadastrar', detalhes: err.message });
    }
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  const usuario = result.rows[0];

  if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
    return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
  }

  const token = jwt.sign({ id: usuario.id, nome: usuario.nome }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, nome: usuario.nome });
});

module.exports = router;
