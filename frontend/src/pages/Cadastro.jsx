import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css'; // Usando o mesmo CSS para manter a consistência

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/cadastrar', { nome, email, senha });
      alert('Cadastro realizado com sucesso! Faça login para continuar.');
      navigate('/login');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao cadastrar');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Criar Conta</h2>
        {erro && <p className="error-message">{erro}</p>}
        <form onSubmit={handleCadastro}>
          <div className="input-group">
            <label>Nome</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
          </div>
          <button type="submit">Cadastrar</button>
        </form>
        <p>Já tem uma conta? <Link to="/login">Entrar</Link></p>
      </div>
    </div>
  );
}

export default Cadastro;
