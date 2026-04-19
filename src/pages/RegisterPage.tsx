import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            await register(username, email, password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { errorMessage?: string } } };
            const msg = axiosError?.response?.data?.errorMessage;
            setError(msg || 'Erro ao criar conta. Verifique os dados e tente novamente.');
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
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-2xl mb-4"
                        style={{ background: 'var(--rango-red)' }}
                    >
                        <span className="brand text-white font-black text-3xl">R</span>
                    </div>
                    <h1 className="brand text-white text-3xl font-bold">Rango PDV</h1>
                    <p className="text-white/50 mt-1 text-sm">Criar nova conta</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {success ? (
                        <div className="flex flex-col items-center gap-3 py-4 text-center">
                            <CheckCircle2 size={48} className="text-green-500" />
                            <h2 className="text-lg font-semibold text-gray-800">
                                Conta criada com sucesso!
                            </h2>
                            <p className="text-sm text-gray-500">
                                Redirecionando para o login...
                            </p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-lg font-semibold text-gray-800 mb-6">
                                Criar conta
                            </h2>

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
                                        E-mail
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Confirmar Senha
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    {loading ? 'Criando conta...' : 'Criar conta'}
                                </button>

                                <p className="text-center text-sm text-gray-500 pt-1">
                                    Já tem conta?{' '}
                                    <Link
                                        to="/login"
                                        className="font-medium"
                                        style={{ color: 'var(--rango-red)' }}
                                    >
                                        Entrar
                                    </Link>
                                </p>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
