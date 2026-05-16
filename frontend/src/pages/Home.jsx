import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Home.css';

function Home() {
  const [resumo, setResumo] = useState({ receitas: 0, despesas: 0, saldo: 0 });
  const [transacoes, setTransacoes] = useState([]);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  
  const [novaTransacao, setNovaTransacao] = useState({
    tipo: 'despesa',
    categoria: '',
    valor: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0]
  });

  const navigate = useNavigate();
  const nomeUsuario = localStorage.getItem('nome');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    carregarDados();
  }, [mes, ano]);

  const carregarDados = async () => {
    try {
      const [resResumo, resTransacoes] = await Promise.all([
        api.get(`/transacoes/resumo?mes=${mes}&ano=${ano}`),
        api.get(`/transacoes?mes=${mes}&ano=${ano}`)
      ]);
      setResumo(resResumo.data);
      setTransacoes(resTransacoes.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
      console.error("Erro ao carregar dados", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    navigate('/login');
  };

  const handleAdicionar = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transacoes', novaTransacao);
      setNovaTransacao({ ...novaTransacao, categoria: '', valor: '', descricao: '' });
      carregarDados();
    } catch (error) {
      alert('Erro ao adicionar transação');
    }
  };

  const handleDeletar = async (id) => {
    if(window.confirm('Tem certeza que deseja remover esta transação?')) {
      try {
        await api.delete(`/transacoes/${id}`);
        carregarDados();
      } catch (error) {
        alert('Erro ao remover transação');
      }
    }
  };

  return (
    <div className="home-container">
      <header className="header">
        <h1>Financiária</h1>
        <div className="user-info">
          <span>Olá, {nomeUsuario}</span>
          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </div>
      </header>

      <main className="main-content">
        <section className="filtros">
          <label>Mês:</label>
          <input type="number" min="1" max="12" value={mes} onChange={e => setMes(e.target.value)} />
          <label>Ano:</label>
          <input type="number" min="2000" max="2100" value={ano} onChange={e => setAno(e.target.value)} />
        </section>

        <section className="resumo-cards">
          <div className="card">
            <h3>Receitas</h3>
            <p className="valor positivo">R$ {Number(resumo.receitas).toFixed(2)}</p>
          </div>
          <div className="card">
            <h3>Despesas</h3>
            <p className="valor negativo">R$ {Number(resumo.despesas).toFixed(2)}</p>
          </div>
          <div className="card">
            <h3>Saldo</h3>
            <p className={`valor ${resumo.saldo >= 0 ? 'positivo' : 'negativo'}`}>
              R$ {Number(resumo.saldo).toFixed(2)}
            </p>
          </div>
        </section>

        <section className="adicionar-transacao">
          <h2>Nova Transação</h2>
          <form onSubmit={handleAdicionar} className="form-inline">
            <select value={novaTransacao.tipo} onChange={e => setNovaTransacao({...novaTransacao, tipo: e.target.value})}>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
            <input type="text" placeholder="Categoria" value={novaTransacao.categoria} onChange={e => setNovaTransacao({...novaTransacao, categoria: e.target.value})} required />
            <input type="number" step="0.01" placeholder="Valor" value={novaTransacao.valor} onChange={e => setNovaTransacao({...novaTransacao, valor: e.target.value})} required />
            <input type="text" placeholder="Descrição" value={novaTransacao.descricao} onChange={e => setNovaTransacao({...novaTransacao, descricao: e.target.value})} />
            <input type="date" value={novaTransacao.data} onChange={e => setNovaTransacao({...novaTransacao, data: e.target.value})} required />
            <button type="submit" className="btn-add">Adicionar</button>
          </form>
        </section>

        <section className="lista-transacoes">
          <h2>Transações</h2>
          {transacoes.length === 0 ? (
            <p>Nenhuma transação encontrada neste mês.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {transacoes.map(t => (
                  <tr key={t.id}>
                    <td>{new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                    <td>{t.categoria}</td>
                    <td>{t.descricao}</td>
                    <td>
                      <span className={`badge ${t.tipo}`}>{t.tipo}</span>
                    </td>
                    <td className={t.tipo === 'receita' ? 'positivo' : 'negativo'}>
                      R$ {Number(t.valor).toFixed(2)}
                    </td>
                    <td>
                      <button onClick={() => handleDeletar(t.id)} className="btn-delete">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}

export default Home;
