import { useState, useEffect } from 'react';
import { Plus, Pencil, Tag, Loader2, CheckCircle, XCircle, X } from 'lucide-react';
import { categoriasService } from '../api/categorias';
import type { CategoriaOutput, CategoriaInput, CategoriaUpdateInput } from '../types';
import { useToast } from '../contexts/ToastContext';

const emptyForm: CategoriaInput = {
    nome: '',
    descricao: '',
};

export function CategoriasPage() {
    const [categorias, setCategorias] = useState<CategoriaOutput[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editCategoria, setEditCategoria] = useState<CategoriaOutput | null>(null);
    const [form, setForm] = useState<CategoriaInput>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { showToast } = useToast();

    async function fetchCategorias() {
        setLoading(true);
        try {
            const data = await categoriasService.listar(0, 50);
            setCategorias(data.items);
        } catch (err) {
            console.error('Erro ao buscar categorias:', err);
            showToast('Erro ao carregar categorias.', 'error');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCategorias();
    }, []);

    function openCreate() {
        setEditCategoria(null);
        setForm(emptyForm);
        setError('');
        setShowModal(true);
    }

    function openEdit(c: CategoriaOutput) {
        setEditCategoria(c);
        setForm({
            nome: c.nome,
            descricao: c.descricao || '',
        });
        setError('');
        setShowModal(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            if (editCategoria) {
                const updateInput: CategoriaUpdateInput = {
                    ...form,
                    ativa: editCategoria.ativa,
                };
                await categoriasService.atualizar(editCategoria.id, updateInput);
                showToast('Categoria atualizada com sucesso!', 'success');
            } else {
                await categoriasService.criar(form);
                showToast('Categoria criada com sucesso!', 'success');
            }
            setShowModal(false);
            await fetchCategorias();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Erro ao salvar categoria.');
        } finally {
            setSubmitting(false);
        }
    }

    async function toggleAtiva(c: CategoriaOutput) {
        try {
            await categoriasService.atualizar(c.id, {
                nome: c.nome,
                descricao: c.descricao || '',
                ativa: !c.ativa,
            });
            await fetchCategorias();
            showToast(`Categoria ${!c.ativa ? 'ativada' : 'desativada'} com sucesso!`, 'success');
        } catch (err) {
            showToast('Erro ao alterar status da categoria.', 'error');
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
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Tag size={20} style={{ color: 'var(--rango-red)' }} />
                    <h1 className="brand text-xl font-bold text-gray-900">Categorias</h1>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all active:scale-95"
                    style={{ background: 'var(--rango-red)' }}
                >
                    <Plus size={16} /> Nova Categoria
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categorias.length === 0 && (
                    <div className="col-span-2 text-center py-16 text-muted-foreground bg-white rounded-2xl border border-dashed border-gray-200">
                        Nenhuma categoria cadastrada.
                    </div>
                )}
                {categorias.map((categoria) => (
                    <div
                        key={categoria.id}
                        className={`card-rango flex flex-col gap-3 ${!categoria.ativa ? 'opacity-60' : ''}`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground truncate">{categoria.nome}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">ID: {categoria.id}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEdit(categoria)}
                                    className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={() => toggleAtiva(categoria)}
                                    className={`text-xs font-medium px-2 py-1 rounded-md transition ${categoria.ativa
                                        ? 'hover:bg-red-50 hover:text-red-600 text-muted-foreground'
                                        : 'hover:bg-green-50 hover:text-green-600 text-muted-foreground'
                                        }`}
                                >
                                    {categoria.ativa ? 'Desativar' : 'Ativar'}
                                </button>
                            </div>
                        </div>
                        {categoria.descricao && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{categoria.descricao}</p>
                        )}
                        <div className="flex items-center pt-1 border-t border-border/50">
                            {categoria.ativa
                                ? <span className="badge-status bg-green-100 text-green-700"><CheckCircle size={11} /> Ativa</span>
                                : <span className="badge-status bg-gray-100 text-gray-500"><XCircle size={11} /> Inativa</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="brand font-bold text-lg">
                                {editCategoria ? 'Editar Categoria' : 'Nova Categoria'}
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                                <input
                                    required
                                    value={form.nome}
                                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                    placeholder="Ex: Hambúrgueres"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea
                                    value={form.descricao || ''}
                                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                                    placeholder="Descrição opcional"
                                />
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
                                    {editCategoria ? 'Salvar' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
