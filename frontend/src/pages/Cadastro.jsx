import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      await api.post('/auth/cadastrar', { nome, email, senha });
      navigate('/login');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background pointer-events-none" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Alternar tema"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 z-10">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
          <TrendingUp className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold text-foreground">Financiária</span>
      </div>

      <Card className="w-full max-w-md z-10 shadow-2xl border-border/50">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>Preencha os dados abaixo para começar</CardDescription>
        </CardHeader>
        <CardContent>
          {erro && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-4 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{erro}</span>
            </div>
          )}
          <form onSubmit={handleCadastro} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Cadastro;
