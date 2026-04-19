import { useState, useEffect } from 'react';
import { Plus, Pencil, UtensilsCrossed, Loader2, CheckCircle, XCircle, X, Trash2 } from 'lucide-react';
import { produtosService } from '../api/produtos';
import { insumosService } from '../api/insumos';
import { categoriasService } from '../api/categorias';
import type { ProdutoOutput, ProdutoInput, ItemReceita, InsumoOutput, CategoriaOutput } from '../types';

function formatBRL(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const emptyForm: ProdutoInput = {
    nome: '',
    descricao: '',
    categoriaIds: [],
    preco: 0,
    receita: [],
};

export function ProdutosPage() {
    const [produtos, setProdutos] = useState<ProdutoOutput[]>([]);
    const [insumos, setInsumos] = useState<InsumoOutput[]>([]);
    const [categorias, setCategorias] = useState<CategoriaOutput[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editProduto, setEditProduto] = useState<ProdutoOutput | null>(null);
    const [form, setForm] = useState<ProdutoInput>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');

    // Receita temp
    const [receitaInsumoId, setReceitaInsumoId] = useState('');
    const [receitaQtd, setReceitaQtd] = useState('');

    async function fetchAll() {
        setLoading(true);
        try {
            const [prods, inss, cats] = await Promise.all([
                produtosService.listar(0, 50),
                insumosService.listar(0, 50),
                categoriasService.listar(0, 50),
            ]);
            setProdutos(prods.items);
            setInsumos(inss.items.filter((i) => i.ativo));
            setCategorias(cats.items);
        } catch (err) {
            console.error('Erro ao buscar dados:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchAll(); }, []);

    const displayCategorias = ['Todos', ...categorias.map((c) => c.nome)];
    const produtosFiltrados = categoriaFiltro === 'Todos'
        ? produtos
        : produtos.filter((p) => {
            const productCats = categorias.filter(c => p.categoriaIds.includes(c.id)).map(c => c.nome);
            return productCats.includes(categoriaFiltro);
        });

    function openCreate() {
        setEditProduto(null);
        setForm(emptyForm);
        setError('');
        setShowModal(true);
    }

    function openEdit(p: ProdutoOutput) {
        setEditProduto(p);
        setForm({
            nome: p.nome,
            descricao: p.descricao || '',
            categoriaIds: p.categoriaIds || [],
            preco: p.preco,
            receita: [...p.receita],
        });
        setError('');
        setShowModal(true);
    }

    function addReceitaItem() {
        if (!receitaInsumoId || !receitaQtd) return;
        const qty = parseFloat(receitaQtd);
        if (!qty || qty <= 0) return;
        setForm((f) => ({
            ...f,
            receita: [
                ...(f.receita || []).filter((r) => r.insumoId !== receitaInsumoId),
                { insumoId: receitaInsumoId, quantidade: qty },
            ],
        }));
        setReceitaInsumoId('');
        setReceitaQtd('');
    }

    function removeReceitaItem(insumoId: string) {
        setForm((f) => ({ ...f, receita: (f.receita || []).filter((r) => r.insumoId !== insumoId) }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            if (editProduto) {
                await produtosService.atualizar(editProduto.id, { ...form, ativo: editProduto.ativo });
            } else {
                await produtosService.criar(form);
            }
            setShowModal(false);
            await fetchAll();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { detail?: string } } };
            setError(e?.response?.data?.detail || 'Erro ao salvar produto.');
        } finally {
            setSubmitting(false);
        }
    }

    async function toggleAtivo(p: ProdutoOutput) {
        await produtosService.atualizar(p.id, {
            nome: p.nome,
            descricao: p.descricao || '',
            categoriaIds: p.categoriaIds,
            preco: p.preco,
            ativo: !p.ativo,
            receita: p.receita,
        });
        await fetchAll();
    }

    function toggleFormCategory(id: string) {
        setForm(f => ({
            ...f,
            categoriaIds: f.categoriaIds.includes(id)
                ? f.categoriaIds.filter(cid => cid !== id)
                : [...f.categoriaIds, id]
        }));
    }

    function getCategoryNames(ids: string[]) {
        return categorias
            .filter(c => ids.includes(c.id))
            .map(c => c.nome)
            .join(', ');
    }

    function insumoNome(id: string) {
        return insumos.find((i) => i.id === id)?.descricao || id.slice(0, 8) + '...';
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <UtensilsCrossed size={20} style={{ color: 'var(--rango-red)' }} />
                    <h1 className="brand text-xl font-bold">Cardápio</h1>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all active:scale-95"
                    style={{ background: 'var(--rango-red)' }}
                >
                    <Plus size={16} /> Novo Produto
                </button>
            </div>

            {/* Filtro categorias */}
            <div className="flex gap-2 overflow-x-auto pb-1 items-center">
                {displayCategorias.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategoriaFiltro(cat)}
                        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${categoriaFiltro === cat ? 'text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        style={categoriaFiltro === cat ? { background: 'var(--rango-red)' } : {}}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {produtosFiltrados.length === 0 && (
                    <div className="col-span-3 text-center py-16 text-muted-foreground">
                        Nenhum produto cadastrado.
                    </div>
                )}
                {produtosFiltrados.map((produto) => (
                    <div
                        key={produto.id}
                        className={`card-rango flex flex-col gap-3 ${!produto.ativo ? 'opacity-60' : ''}`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground truncate">{produto.nome}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate h-4" title={getCategoryNames(produto.categoriaIds)}>
                                    {getCategoryNames(produto.categoriaIds) || 'Sem categoria'}
                                </p>
                            </div>
                            <span className="text-lg font-bold flex-shrink-0" style={{ color: 'var(--rango-red)' }}>
                                {formatBRL(produto.preco)}
                            </span>
                        </div>
                        {produto.descricao && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{produto.descricao}</p>
                        )}
                        {produto.receita.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Receita: </span>
                                {produto.receita.map((r) => `${insumoNome(r.insumoId)}(${r.quantidade})`).join(', ')}
                            </div>
                        )}
                        <div className="flex items-center justify-between pt-1 border-t border-border/50">
                            {produto.ativo
                                ? <span className="badge-status bg-green-100 text-green-700"><CheckCircle size={11} /> Ativo</span>
                                : <span className="badge-status bg-gray-100 text-gray-500"><XCircle size={11} /> Inativo</span>}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEdit(produto)}
                                    className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={() => toggleAtivo(produto)}
                                    className={`text-xs font-medium px-2 py-1 rounded-md transition ${produto.ativo
                                        ? 'hover:bg-red-50 hover:text-red-600 text-muted-foreground'
                                        : 'hover:bg-green-50 hover:text-green-600 text-muted-foreground'
                                        }`}
                                >
                                    {produto.ativo ? 'Desativar' : 'Ativar'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="brand font-bold text-lg">
                                {editProduto ? 'Editar Produto' : 'Novo Produto'}
                            </h3>
                            <button onClick={() => setShowModal(false)}>
                                <X size={18} className="text-muted-foreground" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                                    <input
                                        required value={form.nome}
                                        onChange={(e) => setForm({ ...form, nome: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                        placeholder="Ex: X-Burger"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Categorias *</label>
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border rounded-lg bg-gray-50/50">
                                        {categorias.map(cat => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => toggleFormCategory(cat.id)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${form.categoriaIds.includes(cat.id)
                                                    ? 'bg-red-500 text-white border-red-500 shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                {cat.nome}
                                            </button>
                                        ))}
                                        {categorias.length === 0 && (
                                            <p className="text-[10px] text-muted-foreground p-2">Nenhuma categoria cadastrada. Cadastre-as primeiro.</p>
                                        )}
                                    </div>
                                    {form.categoriaIds.length === 0 && (
                                        <p className="text-[10px] text-red-500 mt-1">* Pelo menos uma categoria é obrigatória</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço *</label>
                                    <input
                                        required type="number" min="0" step="0.01"
                                        value={form.preco}
                                        onChange={(e) => setForm({ ...form, preco: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                    <textarea
                                        value={form.descricao || ''}
                                        onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                                        placeholder="Descrição opcional"
                                    />
                                </div>
                            </div>

                            {/* Receita */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Receita (insumos)</label>
                                {(form.receita || []).length > 0 && (
                                    <div className="mb-2 space-y-1">
                                        {(form.receita as ItemReceita[]).map((r) => (
                                            <div key={r.insumoId} className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-1.5 rounded-lg">
                                                <span className="flex-1">{insumoNome(r.insumoId)}</span>
                                                <span className="text-muted-foreground">x{r.quantidade}</span>
                                                <button type="button" onClick={() => removeReceitaItem(r.insumoId)}>
                                                    <Trash2 size={12} className="text-red-400 hover:text-red-600" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <select
                                        value={receitaInsumoId}
                                        onChange={(e) => setReceitaInsumoId(e.target.value)}
                                        className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                    >
                                        <option value="">Selecionar insumo...</option>
                                        {insumos.map((i) => (
                                            <option key={i.id} value={i.id}>{i.descricao}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number" min="0.001" step="0.001"
                                        value={receitaQtd}
                                        onChange={(e) => setReceitaQtd(e.target.value)}
                                        placeholder="Qtd"
                                        className="w-20 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={addReceitaItem}
                                        className="px-3 py-2 rounded-lg text-white text-sm transition"
                                        style={{ background: 'var(--rango-navy)' }}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60"
                                    style={{ background: 'var(--rango-red)' }}
                                >
                                    {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
                                    {editProduto ? 'Salvar' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
