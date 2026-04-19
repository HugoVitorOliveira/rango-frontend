import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import logoImg from '../assets/logo.png';

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/pdv');
        } catch {
            setError('Usuário ou senha incorretos. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{
                background: `linear-gradient(135deg, var(--rango-navy) 0%, #0f2240 100%)`,
            }}
        >
            <div className="w-full max-w-md px-4">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-40 h-40 mb-2">
                        <img src={logoImg} alt="Rango Logo" className="w-full h-full object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.3)]" />
                    </div>
                    {/* <h1 className="brand text-white text-4xl font-black tracking-tight">Rango PDV</h1>
                    <p className="text-white/40 mt-1 text-sm font-medium uppercase tracking-widest">Sistema Profissional</p> */}
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6">Entrar no sistema</h2>

                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Usuário
                            </label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="seu-usuario"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm 
                           focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Senha
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm 
                           focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white font-semibold text-sm
                         transition-all duration-150 active:scale-95 disabled:opacity-70"
                            style={{ background: 'var(--rango-red)' }}
                        >
                            {loading ? <Loader2 size={17} className="animate-spin" /> : null}
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>

                        <p className="text-center text-sm text-gray-500 pt-1">
                            Não tem conta?{' '}
                            <Link
                                to="/register"
                                className="font-medium"
                                style={{ color: 'var(--rango-red)' }}
                            >
                                Criar conta
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
