import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/context/ThemeContext';
import {
  TrendingUp, TrendingDown, Wallet, LogOut, Moon, Sun,
  Plus, Trash2, ChevronLeft, ChevronRight, BarChart3,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const CATEGORIAS = {
  receita: ['Salário', 'Freelance', 'Investimentos', 'Aluguel', 'Outros'],
  despesa: ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Vestuário', 'Outros'],
};

function Home() {
  const [resumo, setResumo] = useState({ receitas: 0, despesas: 0, saldo: 0 });
  const [transacoes, setTransacoes] = useState([]);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [dialogAberto, setDialogAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [novaTransacao, setNovaTransacao] = useState({
    tipo: 'despesa',
    categoria: '',
    valor: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
  });

  const navigate = useNavigate();
  const nomeUsuario = localStorage.getItem('nome');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    carregarDados();
  }, [mes, ano]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [resResumo, resTransacoes] = await Promise.all([
        api.get(`/transacoes/resumo?mes=${mes}&ano=${ano}`),
        api.get(`/transacoes?mes=${mes}&ano=${ano}`),
      ]);
      setResumo(resResumo.data);
      setTransacoes(resTransacoes.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    } finally {
      setLoading(false);
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
      setNovaTransacao({
        tipo: 'despesa', categoria: '', valor: '', descricao: '',
        data: new Date().toISOString().split('T')[0],
      });
      setDialogAberto(false);
      carregarDados();
    } catch {
      alert('Erro ao adicionar transação');
    }
  };

  const handleDeletar = async (id) => {
    if (window.confirm('Tem certeza que deseja remover esta transação?')) {
      try {
        await api.delete(`/transacoes/${id}`);
        carregarDados();
      } catch {
        alert('Erro ao remover transação');
      }
    }
  };

  const mudarMes = (delta) => {
    let novoMes = mes + delta;
    let novoAno = ano;
    if (novoMes > 12) { novoMes = 1; novoAno++; }
    if (novoMes < 1) { novoMes = 12; novoAno--; }
    setMes(novoMes);
    setAno(novoAno);
  };

  // Dados do gráfico
  const dadosGrafico = [
    { name: 'Receitas', valor: Number(resumo.receitas), fill: '#22c55e' },
    { name: 'Despesas', valor: Number(resumo.despesas), fill: '#ef4444' },
    { name: 'Saldo', valor: Math.abs(Number(resumo.saldo)), fill: resumo.saldo >= 0 ? '#8b5cf6' : '#f97316' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-muted-foreground">R$ {Number(payload[0].value).toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/25">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">Financiária</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Olá, <span className="font-medium text-foreground">{nomeUsuario}</span>
            </span>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Alternar tema"
            >
              {theme === 'dark'
                ? <Sun className="h-4 w-4" />
                : <Moon className="h-4 w-4" />}
            </button>

            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Navegação de mês */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => mudarMes(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center min-w-[140px]">
              <p className="font-semibold text-foreground text-lg">{MESES[mes - 1]}</p>
              <p className="text-sm text-muted-foreground">{ano}</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => mudarMes(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Botão Nova Transação */}
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md shadow-primary/20">
                <Plus className="h-4 w-4" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Nova Transação</DialogTitle>
                <DialogDescription>
                  Adicione uma nova receita ou despesa ao seu controle financeiro.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAdicionar} className="space-y-4 pt-2">
                {/* Tipo */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={novaTransacao.tipo}
                      onValueChange={v => setNovaTransacao({ ...novaTransacao, tipo: v, categoria: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receita">💰 Receita</SelectItem>
                        <SelectItem value="despesa">💸 Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={novaTransacao.categoria}
                      onValueChange={v => setNovaTransacao({ ...novaTransacao, categoria: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(CATEGORIAS[novaTransacao.tipo] || []).map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Valor e Data */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0,00"
                      value={novaTransacao.valor}
                      onChange={e => setNovaTransacao({ ...novaTransacao, valor: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={novaTransacao.data}
                      onChange={e => setNovaTransacao({ ...novaTransacao, data: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição <span className="text-muted-foreground">(opcional)</span></Label>
                  <Input
                    id="descricao"
                    type="text"
                    placeholder="Ex: Almoço no restaurante..."
                    value={novaTransacao.descricao}
                    onChange={e => setNovaTransacao({ ...novaTransacao, descricao: e.target.value })}
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogAberto(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={!novaTransacao.categoria || !novaTransacao.valor}
                  >
                    Adicionar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-green-500/20 dark:border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">Receitas</p>
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                R$ {Number(resumo.receitas).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 dark:border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">Despesas</p>
                <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                R$ {Number(resumo.despesas).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className={resumo.saldo >= 0 ? 'border-primary/30' : 'border-orange-500/20'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">Saldo</p>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${resumo.saldo >= 0 ? 'bg-primary/10' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                  <Wallet className={`h-4 w-4 ${resumo.saldo >= 0 ? 'text-primary' : 'text-orange-600 dark:text-orange-400'}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${resumo.saldo >= 0 ? 'text-primary' : 'text-orange-600 dark:text-orange-400'}`}>
                R$ {Number(resumo.saldo).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Visão Geral do Mês</CardTitle>
            </div>
            <CardDescription>{MESES[mes - 1]} de {ano}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosGrafico} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={v => `R$${v}`}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]} maxBarSize={80} minPointSize={4}>
                  {dadosGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabela de Transações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transações</CardTitle>
            <CardDescription>
              {transacoes.length === 0
                ? 'Nenhuma transação registrada neste período.'
                : `${transacoes.length} transaç${transacoes.length === 1 ? 'ão' : 'ões'} encontrada${transacoes.length === 1 ? '' : 's'}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {transacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Wallet className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">Adicione sua primeira transação!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="hidden sm:table-cell">Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transacoes.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </TableCell>
                      <TableCell className="font-medium">{t.categoria}</TableCell>
                      <TableCell className="text-muted-foreground hidden sm:table-cell">
                        {t.descricao || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.tipo === 'receita' ? 'success' : 'warning'}>
                          {t.tipo === 'receita' ? '↑ Receita' : '↓ Despesa'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${t.tipo === 'receita' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {t.tipo === 'receita' ? '+' : '-'} R$ {Number(t.valor).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletar(t.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default Home;
