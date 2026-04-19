import { api } from './client';
import type { CategoriaOutput, CategoriaInput, CategoriaUpdateInput, PageResult, IdResponse } from '../types';

export const categoriasService = {
    async listar(page = 0, size = 20): Promise<PageResult<CategoriaOutput>> {
        const { data } = await api.get<PageResult<CategoriaOutput>>('/categorias', {
            params: { page, size }
        });
        return data;
    },

    async buscarPorId(id: string): Promise<CategoriaOutput> {
        const { data } = await api.get<CategoriaOutput>(`/categorias/${id}`);
        return data;
    },

    async criar(input: CategoriaInput): Promise<IdResponse> {
        const { data } = await api.post<IdResponse>('/categorias', input);
        return data;
    },

    async atualizar(id: string, input: CategoriaUpdateInput): Promise<void> {
        await api.put(`/categorias/${id}`, input);
    },
};
