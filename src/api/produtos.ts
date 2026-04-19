import api from './client';
import type { ProdutoInput, ProdutoOutput, ProdutoUpdateInput, IdResponse, PageResult } from '../types';

export const produtosService = {
    async listar(page = 0, size = 20): Promise<PageResult<ProdutoOutput>> {
        const { data } = await api.get<PageResult<ProdutoOutput>>('/produtos', {
            params: { page, size }
        });
        return data;
    },

    async buscar(id: string): Promise<ProdutoOutput> {
        const { data } = await api.get<ProdutoOutput>(`/produtos/${id}`);
        return data;
    },

    async criar(input: ProdutoInput): Promise<IdResponse> {
        const { data } = await api.post<IdResponse>('/produtos', input);
        return data;
    },

    async atualizar(id: string, input: ProdutoUpdateInput): Promise<void> {
        await api.put(`/produtos/${id}`, input);
    },
};
