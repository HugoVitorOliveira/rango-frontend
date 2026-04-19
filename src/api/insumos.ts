import api from './client';
import type { InsumoInput, InsumoOutput, InsumoUpdateInput, IdResponse, PageResult } from '../types';

export const insumosService = {
    async listar(page = 0, size = 20): Promise<PageResult<InsumoOutput>> {
        const { data } = await api.get<PageResult<InsumoOutput>>('/insumos', {
            params: { page, size }
        });
        return data;
    },

    async buscar(id: string): Promise<InsumoOutput> {
        const { data } = await api.get<InsumoOutput>(`/insumos/${id}`);
        return data;
    },

    async criar(input: InsumoInput): Promise<IdResponse> {
        const { data } = await api.post<IdResponse>('/insumos', input);
        return data;
    },

    async atualizar(id: string, input: InsumoUpdateInput): Promise<void> {
        await api.put(`/insumos/${id}`, input);
    },
};
