const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token não enviado' });

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ erro: 'Token inválido' });
  }
}

module.exports = { autenticar };
