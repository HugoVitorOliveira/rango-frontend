import api from './client';
import type { PedidoInput, PedidoOutput, PagamentoInput, StatusPedido, IdResponse, PageResult } from '../types';

export const pedidosService = {
    async listar(status?: StatusPedido, page = 0, size = 20): Promise<PageResult<PedidoOutput>> {
        const url = status ? '/pedidos/status' : '/pedidos';
        const params = status ? { status, page, size } : { page, size };

        const { data } = await api.get<PageResult<PedidoOutput>>(url, { params });
        return data;
    },

    async buscar(id: string): Promise<PedidoOutput> {
        const { data } = await api.get<PedidoOutput>(`/pedidos/${id}`);
        return data;
    },

    async criar(input: PedidoInput): Promise<IdResponse> {
        const { data } = await api.post<IdResponse>('/pedidos', input);
        return data;
    },

    async adicionarPagamento(id: string, pagamento: PagamentoInput): Promise<void> {
        await api.post(`/pedidos/${id}/pagamentos`, pagamento);
    },

    async avancarStatus(id: string): Promise<void> {
        await api.patch(`/pedidos/${id}/avancar-status`);
    },

    async cancelar(id: string): Promise<void> {
        await api.patch(`/pedidos/${id}/cancelar`);
    },
};
