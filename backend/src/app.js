const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// Migração automática: garante colunas de soft delete
(async () => {
  try {
    await db.query(`
      ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS excluido BOOLEAN DEFAULT false;
    `);
    await db.query(`
      ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS excluido_em TIMESTAMP;
    `);
    console.log('Migração de soft delete aplicada com sucesso.');
  } catch (err) {
    console.error('Erro na migração:', err.message);
  }
})();

app.use('/auth', require('./routes/auth'));
app.use('/transacoes', require('./routes/transacoes'));

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
