import api from '../lib/api';
import { Category } from '../types';
import { mockCategories } from '../data/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    if (USE_MOCK) {
      return [...mockCategories];
    }
    const response = await api.get('/categories');
    return response.data;
  },

  create: async (data: Omit<Category, 'id'>): Promise<Category> => {
    if (USE_MOCK) {
      const newCategory = { ...data, id: Math.floor(Math.random() * 10000) };
      mockCategories.push(newCategory as any);
      return newCategory as any;
    }
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Category>): Promise<Category> => {
    if (USE_MOCK) {
      const index = mockCategories.findIndex((c: Category) => c.id === id);
      mockCategories[index] = { ...mockCategories[index], ...data };
      return mockCategories[index];
    }
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const index = mockCategories.findIndex((c: Category) => c.id === id);
      mockCategories.splice(index, 1);
      return;
    }
    await api.delete(`/categories/${id}`);
  }
};
