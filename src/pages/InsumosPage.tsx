import { useState, useEffect } from 'react';
import { Plus, Pencil, Package, Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { insumosService } from '../api/insumos';
import type { InsumoOutput, InsumoInput, UnidadeMedida } from '../types';

const UNIDADES: UnidadeMedida[] = ['UNIDADE', 'GRAMA', 'QUILOGRAMA', 'LITRO', 'MILILITRO'];

const UNIDADE_LABEL: Record<UnidadeMedida, string> = {
    UNIDADE: 'Un.',
    GRAMA: 'g',
    QUILOGRAMA: 'kg',
    LITRO: 'L',
    MILILITRO: 'mL',
};

function formatBRL(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const emptyForm: InsumoInput = {
    descricao: '',
    unidadeMedida: 'UNIDADE',
    custoUnitario: 0,
    quantidadeEstoque: 0,
    estoqueMinimo: 0,
};

export function InsumosPage() {
    const [insumos, setInsumos] = useState<InsumoOutput[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editInsumo, setEditInsumo] = useState<InsumoOutput | null>(null);
    const [form, setForm] = useState<InsumoInput>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    async function fetchInsumos() {
        setLoading(true);
        try {
            const data = await insumosService.listar();
            setInsumos(data.items);
        } catch (err) {
            console.error('Erro ao buscar insumos:', err);
            setInsumos([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchInsumos(); }, []);

    function openCreate() {
        setEditInsumo(null);
        setForm(emptyForm);
        setError('');
        setShowModal(true);
    }

    function openEdit(insumo: InsumoOutput) {
        setEditInsumo(insumo);
        setForm({
            descricao: insumo.descricao,
            unidadeMedida: insumo.unidadeMedida,
            custoUnitario: insumo.custoUnitario,
            quantidadeEstoque: insumo.quantidadeEstoque,
            estoqueMinimo: insumo.estoqueMinimo,
        });
        setError('');
        setShowModal(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            if (editInsumo) {
                await insumosService.atualizar(editInsumo.id, { ...form, ativo: editInsumo.ativo });
            } else {
                await insumosService.criar(form);
            }
            setShowModal(false);
            await fetchInsumos();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { detail?: string } } };
            setError(e?.response?.data?.detail || 'Erro ao salvar insumo.');
        } finally {
            setSubmitting(false);
        }
    }

    async function toggleAtivo(insumo: InsumoOutput) {
        await insumosService.atualizar(insumo.id, {
            descricao: insumo.descricao,
            unidadeMedida: insumo.unidadeMedida,
            custoUnitario: insumo.custoUnitario,
            quantidadeEstoque: insumo.quantidadeEstoque,
            estoqueMinimo: insumo.estoqueMinimo,
            ativo: !insumo.ativo,
        });
        await fetchInsumos();
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
                    <Package size={20} style={{ color: 'var(--rango-red)' }} />
                    <h1 className="brand text-xl font-bold">Insumos</h1>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all active:scale-95"
                    style={{ background: 'var(--rango-red)' }}
                >
                    <Plus size={16} /> Novo Insumo
                </button>
            </div>

            {/* Tabela */}
            <div className="card-rango overflow-hidden p-0">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Insumo</th>
                            <th className="text-left px-3 py-3 font-semibold text-muted-foreground">Unidade</th>
                            <th className="text-right px-3 py-3 font-semibold text-muted-foreground">Custo Un.</th>
                            <th className="text-right px-3 py-3 font-semibold text-muted-foreground">Estoque</th>
                            <th className="text-right px-3 py-3 font-semibold text-muted-foreground">Mín.</th>
                            <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Status</th>
                            <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {insumos.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-muted-foreground">
                                    Nenhum insumo cadastrado.
                                </td>
                            </tr>
                        )}
                        {insumos.map((insumo) => {
                            const estoqueAlerta = insumo.quantidadeEstoque <= insumo.estoqueMinimo;
                            return (
                                <tr key={insumo.id} className="border-b border-border/50 hover:bg-muted/30 transition">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2">
                                            {estoqueAlerta && (
                                                <AlertTriangle size={14} className="text-yellow-500 flex-shrink-0" />
                                            )}
                                            <span className="font-medium">{insumo.descricao}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3.5 text-muted-foreground">{UNIDADE_LABEL[insumo.unidadeMedida]}</td>
                                    <td className="px-3 py-3.5 text-right font-mono text-sm">{formatBRL(insumo.custoUnitario)}</td>
                                    <td className={`px-3 py-3.5 text-right font-semibold ${estoqueAlerta ? 'text-yellow-600' : 'text-foreground'}`}>
                                        {insumo.quantidadeEstoque}
                                    </td>
                                    <td className="px-3 py-3.5 text-right text-muted-foreground">{insumo.estoqueMinimo}</td>
                                    <td className="px-3 py-3.5 text-center">
                                        {insumo.ativo
                                            ? <span className="badge-status bg-green-100 text-green-700"><CheckCircle size={11} /> Ativo</span>
                                            : <span className="badge-status bg-gray-100 text-gray-500"><XCircle size={11} /> Inativo</span>}
                                    </td>
                                    <td className="px-3 py-3.5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => openEdit(insumo)}
                                                className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"
                                                title="Editar"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => toggleAtivo(insumo)}
                                                className={`p-1.5 rounded-md transition text-xs font-medium px-2 ${insumo.ativo
                                                    ? 'hover:bg-red-50 hover:text-red-600 text-muted-foreground'
                                                    : 'hover:bg-green-50 hover:text-green-600 text-muted-foreground'
                                                    }`}
                                                title={insumo.ativo ? 'Desativar' : 'Ativar'}
                                            >
                                                {insumo.ativo ? 'Desativar' : 'Ativar'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="brand font-bold text-lg mb-5">
                            {editInsumo ? 'Editar Insumo' : 'Novo Insumo'}
                        </h3>
                        {error && (
                            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                                <input
                                    required
                                    value={form.descricao}
                                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                    placeholder="Ex: Carne 120g"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unidade de Medida *</label>
                                <select
                                    value={form.unidadeMedida}
                                    onChange={(e) => setForm({ ...form, unidadeMedida: e.target.value as UnidadeMedida })}
                                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                >
                                    {UNIDADES.map((u) => (
                                        <option key={u} value={u}>{u} ({UNIDADE_LABEL[u]})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Custo Un. *</label>
                                    <input
                                        required type="number" min="0" step="0.01"
                                        value={form.custoUnitario}
                                        onChange={(e) => setForm({ ...form, custoUnitario: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estoque *</label>
                                    <input
                                        required type="number" min="0"
                                        value={form.quantidadeEstoque}
                                        onChange={(e) => setForm({ ...form, quantidadeEstoque: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mín. *</label>
                                    <input
                                        required type="number" min="0"
                                        value={form.estoqueMinimo}
                                        onChange={(e) => setForm({ ...form, estoqueMinimo: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                    />
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
                                    {editInsumo ? 'Salvar' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
