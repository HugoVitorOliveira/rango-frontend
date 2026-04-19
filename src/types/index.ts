// ---- Enums ----

export type UnidadeMedida = 'UNIDADE' | 'GRAMA' | 'QUILOGRAMA' | 'LITRO' | 'MILILITRO';

export type TipoPedido = 'MESA' | 'BALCAO' | 'RETIRADA' | 'DELIVERY';

export type StatusPedido = 'ABERTO' | 'EM_PREPARO' | 'PRONTO' | 'ENTREGUE' | 'CANCELADO';

export type FormaPagamento = 'DINHEIRO' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'PIX';

// ---- Generic types ----

export interface PageResult<T> {
    items: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

// ---- Response types ----

export interface InsumoOutput {
    id: string;
    descricao: string;
    unidadeMedida: UnidadeMedida;
    custoUnitario: number;
    quantidadeEstoque: number;
    estoqueMinimo: number;
    ativo: boolean;
}

export interface ItemReceita {
    insumoId: string;
    quantidade: number;
}

export interface CategoriaOutput {
    id: string;
    nome: string;
    descricao: string | null;
    ativa: boolean;
}

export interface ProdutoOutput {
    id: string;
    nome: string;
    descricao: string | null;
    categoriaIds: string[];
    preco: number;
    ativo: boolean;
    receita: ItemReceita[];
}

export interface ItemPedido {
    produtoId: string;
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
}

export interface Pagamento {
    forma: FormaPagamento;
    valor: number;
}

export interface PedidoOutput {
    id: string;
    numero: number;
    tipo: TipoPedido;
    status: StatusPedido;
    total: number;
    itens: ItemPedido[];
    pagamentos: Pagamento[];
    criadoEm: string;
}

export interface IdResponse {
    id: string;
}

// ---- Request / Input types ----

export interface InsumoInput {
    descricao: string;
    unidadeMedida: UnidadeMedida;
    custoUnitario: number;
    quantidadeEstoque: number;
    estoqueMinimo: number;
}

export interface InsumoUpdateInput extends InsumoInput {
    ativo: boolean;
}

export interface CategoriaInput {
    nome: string;
    descricao?: string;
}

export interface CategoriaUpdateInput extends CategoriaInput {
    ativa: boolean;
}

export interface ProdutoInput {
    nome: string;
    descricao?: string;
    categoriaIds: string[];
    preco: number;
    receita?: ItemReceita[];
}

export interface ProdutoUpdateInput extends ProdutoInput {
    ativo: boolean;
}

export interface ItemPedidoInput {
    produtoId: string;
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
}

export interface PedidoInput {
    tipo: TipoPedido;
    itens: ItemPedidoInput[];
}

export interface PagamentoInput {
    forma: FormaPagamento;
    valor: number;
}

// ---- Cart types (local) ----

export interface CartItem {
    produto: ProdutoOutput;
    quantidade: number;
}
