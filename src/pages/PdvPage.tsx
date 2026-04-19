import { useState, useEffect, useCallback } from 'react';
import { Plus, Minus, Trash2, ShoppingBag, X, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { produtosService } from '../api/produtos';
import { pedidosService } from '../api/pedidos';
import { categoriasService } from '../api/categorias';
import type {
    ProdutoOutput, CartItem, TipoPedido, FormaPagamento, PagamentoInput, CategoriaOutput
} from '../types';

const TIPOS_PEDIDO: { value: TipoPedido; label: string }[] = [
    { value: 'MESA', label: '🍽️ Mesa' },
    { value: 'BALCAO', label: '🏪 Balcão' },
    { value: 'RETIRADA', label: '🛍️ Retirada' },
    { value: 'DELIVERY', label: '🛵 Delivery' },
];

const FORMAS_PGTO: { value: FormaPagamento; label: string }[] = [
    { value: 'DINHEIRO', label: '💵 Dinheiro' },
    { value: 'PIX', label: '📱 PIX' },
    { value: 'CARTAO_DEBITO', label: '💳 Débito' },
    { value: 'CARTAO_CREDITO', label: '💳 Crédito' },
];

function formatBRL(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PdvPage() {
    const [produtos, setProdutos] = useState<ProdutoOutput[]>([]);
    const [categorias, setCategorias] = useState<CategoriaOutput[]>([]);
    const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useToast();

    // Modal pedido
    const [showPedidoModal, setShowPedidoModal] = useState(false);
    const [tipo, setTipo] = useState<TipoPedido>('MESA');
    const [pedidoId, setPedidoId] = useState<string | null>(null);

    // Modal pagamento
    const [showPgtoModal, setShowPgtoModal] = useState(false);
    const [pagamentos, setPagamentos] = useState<PagamentoInput[]>([]);
    const [formaPgto, setFormaPgto] = useState<FormaPagamento>('PIX');
    const [valorPgto, setValorPgto] = useState('');
    const [pgtoError, setPgtoError] = useState('');

    const totalCart = cart.reduce((s, i) => s + i.produto.preco * i.quantidade, 0);
    const totalPago = pagamentos.reduce((s, p) => s + p.valor, 0);
    const restante = Math.max(0, totalCart - totalPago);

    useEffect(() => {
        Promise.all([
            produtosService.listar(0, 50),
            categoriasService.listar(0, 50)
        ]).then(([prodData, catData]) => {
            setProdutos(prodData.items.filter((p) => p.ativo));
            setCategorias(catData.items.filter((c) => c.ativa));
            setLoading(false);
        }).catch(() => {
            setLoading(false);
            showToast('Erro ao carregar dados do sistema.', 'error');
        });
    }, [showToast]);

    const displayCategorias = ['Todos', ...categorias.map((c) => c.nome)];
    const produtosFiltrados = categoriaAtiva === 'Todos'
        ? produtos
        : produtos.filter((p) => {
            const productCats = categorias.filter(c => p.categoriaIds.includes(c.id)).map(c => c.nome);
            return productCats.includes(categoriaAtiva);
        });

    function getCategoryNames(ids: string[]) {
        return categorias
            .filter(c => ids.includes(c.id))
            .map(c => c.nome)
            .join(', ');
    }

    const addToCart = useCallback((produto: ProdutoOutput) => {
        setCart((prev) => {
            const idx = prev.findIndex((i) => i.produto.id === produto.id);
            if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], quantidade: updated[idx].quantidade + 1 };
                return updated;
            }
            return [...prev, { produto, quantidade: 1 }];
        });
    }, []);

    const removeOne = (id: string) => {
        setCart((prev) =>
            prev
                .map((i) => (i.produto.id === id ? { ...i, quantidade: i.quantidade - 1 } : i))
                .filter((i) => i.quantidade > 0)
        );
    };

    const removeItem = (id: string) => {
        setCart((prev) => prev.filter((i) => i.produto.id !== id));
    };

    async function confirmarPedido() {
        setSubmitting(true);
        try {
            const { id } = await pedidosService.criar({
                tipo,
                itens: cart.map((i) => ({
                    produtoId: i.produto.id,
                    nomeProduto: i.produto.nome,
                    quantidade: i.quantidade,
                    precoUnitario: i.produto.preco,
                })),
            });
            setPedidoId(id);
            setPagamentos([]);
            setValorPgto(restante > 0 ? totalCart.toFixed(2) : '');
            setShowPedidoModal(false);
            setShowPgtoModal(true);
        } catch {
            showToast('Erro ao criar pedido. Verifique a conexão com o servidor.', 'error');
        } finally {
            setSubmitting(false);
        }
    }

    async function adicionarPagamento() {
        if (!pedidoId) return;
        const valor = parseFloat(valorPgto.replace(',', '.'));
        if (!valor || valor <= 0) {
            setPgtoError('Informe um valor válido.');
            return;
        }
        if (valor > restante + 0.001) {
            setPgtoError(`Valor excede o restante (${formatBRL(restante)}).`);
            return;
        }
        setPgtoError('');
        setSubmitting(true);
        try {
            await pedidosService.adicionarPagamento(pedidoId, { forma: formaPgto, valor });
            const novosPgtos = [...pagamentos, { forma: formaPgto, valor }];
            setPagamentos(novosPgtos);
            setValorPgto('');
            const novoRestante = totalCart - novosPgtos.reduce((s, p) => s + p.valor, 0);
            if (novoRestante <= 0.001) {
                // Pagamento completo
                setCart([]);
                setShowPgtoModal(false);
                setPedidoId(null);
                showToast(`Pedido finalizado e pago com sucesso!`, 'success');
            }
        } catch {
            setPgtoError('Erro ao registrar pagamento.');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="flex h-full overflow-hidden">
            {/* Produtos */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border bg-card">
                    <h1 className="brand text-xl font-bold text-foreground">Caixa / PDV</h1>
                    {/* Categorias */}
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                        {displayCategorias.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategoriaAtiva(cat)}
                                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${categoriaAtiva === cat
                                    ? 'text-white shadow-md'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                style={categoriaAtiva === cat ? { background: 'var(--rango-red)' } : {}}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid de produtos */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {produtosFiltrados.map((produto) => (
                            <button
                                key={produto.id}
                                onClick={() => addToCart(produto)}
                                className="card-rango text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 active:scale-95 group"
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                                    style={{ background: 'var(--rango-offwhite)' }}>
                                    🍔
                                </div>
                                <p className="font-semibold text-sm text-foreground leading-tight line-clamp-2">{produto.nome}</p>
                                {produto.descricao && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{produto.descricao}</p>
                                )}
                                <p className="mt-2 font-bold text-base" style={{ color: 'var(--rango-red)' }}>
                                    {formatBRL(produto.preco)}
                                </p>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight truncate w-full block">
                                    {getCategoryNames(produto.categoriaIds) || 'Sem categoria'}
                                </span>
                            </button>
                        ))}
                    </div>
                    {produtosFiltrados.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">
                            <p className="text-4xl mb-2">🍽️</p>
                            <p>Nenhum produto nesta categoria.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Carrinho */}
            <div className="w-80 border-l border-border bg-card flex flex-col overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                    <ShoppingBag size={18} style={{ color: 'var(--rango-red)' }} />
                    <h2 className="brand font-bold text-foreground">Carrinho</h2>
                    <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                        {cart.reduce((s, i) => s + i.quantidade, 0)} itens
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                    {cart.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Carrinho vazio</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.produto.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.produto.nome}</p>
                                    <p className="text-xs text-muted-foreground">{formatBRL(item.produto.preco)} un.</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => removeOne(item.produto.id)}
                                        className="w-6 h-6 rounded bg-background border border-border flex items-center justify-center hover:bg-muted transition"
                                    >
                                        <Minus size={11} />
                                    </button>
                                    <span className="w-6 text-center text-sm font-semibold">{item.quantidade}</span>
                                    <button
                                        onClick={() => addToCart(item.produto)}
                                        className="w-6 h-6 rounded flex items-center justify-center transition text-white"
                                        style={{ background: 'var(--rango-red)' }}
                                    >
                                        <Plus size={11} />
                                    </button>
                                </div>
                                <button onClick={() => removeItem(item.produto.id)} className="text-muted-foreground hover:text-destructive transition">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="px-5 py-4 border-t border-border space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground font-medium">Total</span>
                        <span className="text-xl font-bold" style={{ color: 'var(--rango-red)' }}>{formatBRL(totalCart)}</span>
                    </div>
                    <button
                        disabled={cart.length === 0}
                        onClick={() => setShowPedidoModal(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-all active:scale-95 disabled:opacity-40"
                        style={{ background: 'var(--rango-red)' }}
                    >
                        <CreditCard size={17} />
                        Fechar Pedido
                    </button>
                </div>
            </div>

            {/* Modal tipo do pedido */}
            {showPedidoModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="brand font-bold text-lg">Tipo do Pedido</h3>
                            <button onClick={() => setShowPedidoModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {TIPOS_PEDIDO.map((t) => (
                                <button
                                    key={t.value}
                                    onClick={() => setTipo(t.value)}
                                    className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${tipo === t.value ? 'border-red-500 text-red-600 bg-red-50' : 'border-border text-foreground hover:border-gray-300'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        <div className="border-t border-border pt-4 mb-4">
                            <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                <span>{cart.reduce((s, i) => s + i.quantidade, 0)} itens</span>
                                <span className="font-bold text-foreground text-base">{formatBRL(totalCart)}</span>
                            </div>
                        </div>
                        <button
                            onClick={confirmarPedido}
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-all active:scale-95 disabled:opacity-60"
                            style={{ background: 'var(--rango-red)' }}
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                            Confirmar Pedido
                        </button>
                    </div>
                </div>
            )}

            {/* Modal pagamento */}
            {showPgtoModal && pedidoId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="brand font-bold text-lg">Pagamento</h3>
                            <button onClick={() => setShowPgtoModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Resumo */}
                        <div className="bg-muted/50 rounded-xl p-4 mb-4 space-y-1.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total do pedido</span>
                                <span className="font-semibold">{formatBRL(totalCart)}</span>
                            </div>
                            {pagamentos.map((p, i) => (
                                <div key={i} className="flex justify-between text-sm text-green-600">
                                    <span>{FORMAS_PGTO.find((f) => f.value === p.forma)?.label}</span>
                                    <span>- {formatBRL(p.valor)}</span>
                                </div>
                            ))}
                            <div className="border-t border-border pt-1.5 flex justify-between font-bold">
                                <span>Restante</span>
                                <span style={{ color: restante > 0 ? 'var(--rango-red)' : 'green' }}>{formatBRL(restante)}</span>
                            </div>
                        </div>

                        {restante > 0 && (
                            <>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {FORMAS_PGTO.map((f) => (
                                        <button
                                            key={f.value}
                                            onClick={() => setFormaPgto(f.value)}
                                            className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${formaPgto === f.value ? 'border-red-500 text-red-600 bg-red-50' : 'border-border hover:border-gray-300'
                                                }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={valorPgto}
                                        onChange={(e) => setValorPgto(e.target.value)}
                                        placeholder={`Valor (máx ${formatBRL(restante)})`}
                                        className="flex-1 px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                    />
                                    <button
                                        onClick={() => setValorPgto(restante.toFixed(2))}
                                        className="px-3 py-2 rounded-lg bg-muted text-muted-foreground text-xs hover:bg-muted/80 transition"
                                    >
                                        Max
                                    </button>
                                </div>
                                {pgtoError && <p className="text-red-500 text-xs mb-2">{pgtoError}</p>}
                                <button
                                    onClick={adicionarPagamento}
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-all active:scale-95 disabled:opacity-60"
                                    style={{ background: 'var(--rango-red)' }}
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                                    Registrar Pagamento
                                </button>
                            </>
                        )}
                        {restante <= 0 && (
                            <div className="text-center py-4">
                                <p className="text-green-600 font-semibold text-lg">✅ Pedido pago!</p>
                                <button
                                    onClick={() => { setShowPgtoModal(false); setCart([]); setPedidoId(null); }}
                                    className="mt-3 px-6 py-2.5 rounded-xl text-white font-semibold transition-all"
                                    style={{ background: 'var(--rango-navy)' }}
                                >
                                    Novo Pedido
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
