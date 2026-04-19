import { useState, useEffect, useCallback } from 'react';
import { ChefHat, ArrowRight, XCircle, Loader2, RefreshCw, Clock } from 'lucide-react';
import { pedidosService } from '../api/pedidos';
import type { PedidoOutput, StatusPedido } from '../types';

const STATUS_LABELS: Record<StatusPedido, string> = {
    ABERTO: 'Aberto',
    EM_PREPARO: 'Em Preparo',
    PRONTO: 'Pronto',
    ENTREGUE: 'Entregue',
    CANCELADO: 'Cancelado',
};

const STATUS_NEXT: Partial<Record<StatusPedido, string>> = {
    ABERTO: 'Iniciar Preparo',
    EM_PREPARO: 'Marcar Pronto',
    PRONTO: 'Marcar Entregue',
};

const TIPO_LABELS: Record<string, string> = {
    MESA: '🍽️ Mesa',
    BALCAO: '🏪 Balcão',
    RETIRADA: '🛍️ Retirada',
    DELIVERY: '🛵 Delivery',
};

function BadgeStatus({ status }: { status: StatusPedido }) {
    const classes: Record<StatusPedido, string> = {
        ABERTO: 'badge-aberto',
        EM_PREPARO: 'badge-em_preparo',
        PRONTO: 'badge-pronto',
        ENTREGUE: 'badge-entregue',
        CANCELADO: 'badge-cancelado',
    };
    return <span className={`badge-status ${classes[status]}`}>{STATUS_LABELS[status]}</span>;
}

function formatBRL(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function CozinhaPage() {
    const [pedidos, setPedidos] = useState<PedidoOutput[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const fetchPedidos = useCallback(async () => {
        try {
            const [abertos, emPreparo, prontos] = await Promise.all([
                pedidosService.listar('ABERTO'),
                pedidosService.listar('EM_PREPARO'),
                pedidosService.listar('PRONTO'),
            ]);
            setPedidos([...abertos.items, ...emPreparo.items, ...prontos.items]);
            setLastUpdate(new Date());
        } catch {
            // silently fail on polling
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPedidos();
        const interval = setInterval(fetchPedidos, 15000);
        return () => clearInterval(interval);
    }, [fetchPedidos]);

    async function avancar(id: string) {
        setActionLoading(id);
        try {
            await pedidosService.avancarStatus(id);
            await fetchPedidos();
        } finally {
            setActionLoading(null);
        }
    }

    async function cancelar(id: string) {
        if (!confirm('Cancelar este pedido?')) return;
        setActionLoading(id + '_cancel');
        try {
            await pedidosService.cancelar(id);
            await fetchPedidos();
        } finally {
            setActionLoading(null);
        }
    }

    const columns = ['ABERTO', 'EM_PREPARO', 'PRONTO'] as const;
    const colColors = {
        ABERTO: 'blue',
        EM_PREPARO: 'yellow',
        PRONTO: 'green',
    } as const;
    const colBg: Record<string, string> = {
        ABERTO: 'bg-blue-50 border-blue-200',
        EM_PREPARO: 'bg-yellow-50 border-yellow-200',
        PRONTO: 'bg-green-50 border-green-200',
    };
    const colHeader: Record<string, string> = {
        ABERTO: 'text-blue-700',
        EM_PREPARO: 'text-yellow-700',
        PRONTO: 'text-green-700',
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-card flex items-center gap-3">
                <ChefHat size={20} style={{ color: 'var(--rango-red)' }} />
                <h1 className="brand text-xl font-bold">Cozinha (KDS)</h1>
                <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        Atualizado às {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <button
                        onClick={fetchPedidos}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted transition"
                    >
                        <RefreshCw size={13} />
                        Atualizar
                    </button>
                </div>
            </div>

            {/* Kanban */}
            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-3 gap-5 min-h-full">
                    {columns.map((status) => {
                        const colPedidos = pedidos.filter((p) => p.status === status);
                        return (
                            <div key={status} className={`rounded-2xl border-2 ${colBg[status]} p-4 flex flex-col`}>
                                {/* Col header */}
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className={`brand font-bold text-sm ${colHeader[status]}`}>
                                        {STATUS_LABELS[status]}
                                    </h2>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 ${colHeader[status]}`}>
                                        {colPedidos.length}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div className="space-y-3 flex-1">
                                    {colPedidos.length === 0 && (
                                        <div className="text-center py-10 text-muted-foreground text-sm opacity-60">
                                            Nenhum pedido
                                        </div>
                                    )}
                                    {colPedidos.map((pedido) => (
                                        <div key={pedido.id} className="bg-white rounded-xl shadow-sm border border-white/80 p-4 space-y-3">
                                            {/* Pedido header */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="brand font-bold text-base leading-tight">
                                                        #{pedido.numero}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{TIPO_LABELS[pedido.tipo]}</p>
                                                </div>
                                                <BadgeStatus status={pedido.status} />
                                            </div>

                                            {/* Itens */}
                                            <div className="space-y-1">
                                                {pedido.itens.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-foreground font-medium">
                                                            <span className="text-muted-foreground">{item.quantidade}x</span> {item.nomeProduto}
                                                        </span>
                                                        <span className="text-muted-foreground text-xs self-center">
                                                            {formatBRL(item.subtotal)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Ações */}
                                            <div className="flex gap-2 pt-1">
                                                {STATUS_NEXT[pedido.status] && (
                                                    <button
                                                        onClick={() => avancar(pedido.id)}
                                                        disabled={actionLoading === pedido.id}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-60"
                                                        style={{ background: `var(--rango-${colColors[status] === 'blue' ? 'red' : colColors[status] === 'yellow' ? 'red' : 'navy'})` }}
                                                    >
                                                        {actionLoading === pedido.id ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={13} />}
                                                        {STATUS_NEXT[pedido.status]}
                                                    </button>
                                                )}
                                                {pedido.status !== 'ENTREGUE' && pedido.status !== 'CANCELADO' && (
                                                    <button
                                                        onClick={() => cancelar(pedido.id)}
                                                        disabled={actionLoading === pedido.id + '_cancel'}
                                                        className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
                                                        title="Cancelar pedido"
                                                    >
                                                        {actionLoading === pedido.id + '_cancel' ? (
                                                            <Loader2 size={13} className="animate-spin" />
                                                        ) : (
                                                            <XCircle size={13} />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
