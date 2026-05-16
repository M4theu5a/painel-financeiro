import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, senha });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('nome', response.data.nome);
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao fazer login');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Entrar na Financiária</h2>
        {erro && <p className="error-message">{erro}</p>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
          </div>
          <button type="submit">Entrar</button>
        </form>
        <p>Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link></p>
      </div>
    </div>
  );
}

export default Login;
