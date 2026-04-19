import { NavLink, useNavigate } from 'react-router-dom';
import {
    ShoppingCart,
    ChefHat,
    Package,
    UtensilsCrossed,
    Receipt,
    LogOut,
    User,
    Tag,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logoImg from '../assets/logo.png';

const navLinks = [
    { to: '/pdv', icon: ShoppingCart, label: 'Caixa / PDV' },
    { to: '/pedidos', icon: Receipt, label: 'Gerenciar Pedidos' },
    { to: '/cozinha', icon: ChefHat, label: 'Cozinha (KDS)' },
    { to: '/produtos', icon: UtensilsCrossed, label: 'Cardápio' },
    { to: '/insumos', icon: Package, label: 'Insumos' },
    { to: '/categorias', icon: Tag, label: 'Categorias' },
];

export function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <aside
            className="w-64 flex flex-col h-screen sticky top-0"
            style={{ background: 'var(--rango-navy)' }}
        >
            {/* Brand */}
            <div className="px-6 py-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 flex items-center justify-center shrink-0">
                        <img src={logoImg} alt="Rango Logo" className="w-full h-full object-contain drop-shadow-lg" />
                    </div>
                    <div>
                        <p className="brand text-white font-black text-xl leading-none tracking-tight">Rango PDV</p>
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Sistema de Gestão</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navLinks.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* User + Logout */}
            <div className="px-3 py-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-4 py-2.5 mb-1">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <User size={15} className="text-white/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/50">Logado como</p>
                        <p className="text-sm text-white font-medium truncate">{user?.username}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="sidebar-link w-full hover:bg-red-500/20 hover:text-red-300"
                >
                    <LogOut size={16} />
                    Sair
                </button>
            </div>
        </aside>
    );
}
