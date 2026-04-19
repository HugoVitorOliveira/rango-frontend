import { useState, useEffect, useCallback } from 'react';
import {
    Search, Filter, Receipt, Clock, CheckCircle2,
    XCircle, Play, ChevronRight, Loader2, RefreshCw
} from 'lucide-react';
import { pedidosService } from '../api/pedidos';
import { useToast } from '../contexts/ToastContext';
import type { PedidoOutput, StatusPedido } from '../types';

const STATUS_CONFIG: Record<StatusPedido, { label: string; bg: string; text: string; icon: any }> = {
    ABERTO: { label: 'Aberto', bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock },
    EM_PREPARO: { label: 'Em Preparo', bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Play },
    PRONTO: { label: 'Pronto', bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2 },
    ENTREGUE: { label: 'Entregue', bg: 'bg-gray-100', text: 'text-gray-700', icon: Receipt },
    CANCELADO: { label: 'Cancelado', bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
};

const TIPO_LABELS: Record<string, string> = {
    MESA: 'Mesa',
    BALCAO: 'Balcão',
    RETIRADA: 'Retirada',
    DELIVERY: 'Delivery',
};

function formatBRL(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PedidosPage() {
    const [pedidos, setPedidos] = useState<PedidoOutput[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState<StatusPedido | 'TODOS'>('TODOS');
    const [busca, setBusca] = useState('');
    const { showToast } = useToast();

    const fetchPedidos = useCallback(async () => {
        try {
            const data = await pedidosService.listar(
                filtroStatus === 'TODOS' ? undefined : filtroStatus
            );
            // Ordenar por número decrescente
            setPedidos(data.items.sort((a, b) => b.numero - a.numero));
        } catch {
            showToast('Erro ao carregar pedidos.', 'error');
        } finally {
            setLoading(false);
        }
    }, [filtroStatus, showToast]);

    useEffect(() => {
        fetchPedidos();
    }, [fetchPedidos]);

    const pedidosFiltrados = busca
        ? pedidos.filter(p => p.numero.toString().includes(busca))
        : pedidos;

    return (
        <div className="flex flex-col h-full overflow-hidden bg-[#f8f9fa]">
            {/* Header */}
            <div className="px-8 py-6 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="brand text-2xl font-bold text-gray-900">Gerenciar Pedidos</h1>
                        <p className="text-gray-500 text-sm mt-1">Visualize e acompanhe todos os pedidos do sistema</p>
                    </div>
                    <button
                        onClick={() => { setLoading(true); fetchPedidos(); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium text-sm"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Atualizar
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por número do pedido..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400 transition text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <Filter size={16} className="text-gray-400 mr-1" />
                        {(['TODOS', 'ABERTO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setFiltroStatus(s)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filtroStatus === s
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {s === 'TODOS' ? 'Todos' : STATUS_CONFIG[s].label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-8">
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="animate-spin text-red-500" size={40} />
                    </div>
                ) : pedidosFiltrados.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <Receipt size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-gray-900 font-bold text-lg">Nenhum pedido encontrado</h3>
                        <p className="text-gray-500 text-sm">Tente ajustar seus filtros ou busca.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {pedidosFiltrados.map((pedido) => {
                            const Config = STATUS_CONFIG[pedido.status];
                            const Icon = Config.icon;

                            return (
                                <div
                                    key={pedido.id}
                                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow group flex items-center gap-6"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex flex-col items-center justify-center border border-gray-100">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Ped</span>
                                        <span className="text-lg font-black text-gray-800 leading-none">#{pedido.numero}</span>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${Config.bg} ${Config.text}`}>
                                                <Icon size={12} />
                                                {Config.label}
                                            </span>
                                            <span className="text-xs text-gray-400 font-medium">•</span>
                                            <span className="text-xs text-gray-500 font-bold uppercase">{TIPO_LABELS[pedido.tipo]}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-gray-600">
                                                {pedido.itens.length} {pedido.itens.length === 1 ? 'item' : 'itens'}
                                            </p>
                                            <span className="text-gray-300">|</span>
                                            <p className="text-xs text-gray-400">
                                                {pedido.criadoEm
                                                    ? new Date(pedido.criadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                                                    : 'Data não disponível'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right pr-4">
                                        <p className="text-gray-400 text-[10px] font-bold uppercase leading-none mb-1">Valor Total</p>
                                        <p className="text-xl font-black text-gray-900">{formatBRL(pedido.total)}</p>
                                    </div>

                                    <button
                                        className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-500 transition-all"
                                        title="Ver detalhes"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
