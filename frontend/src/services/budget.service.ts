import api from '../lib/api';
import { Budget } from '../types';
import { mockBudgets } from '../data/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const budgetService = {
  getAll: async (): Promise<Budget[]> => {
    if (USE_MOCK) {
      return [...mockBudgets];
    }
    const response = await api.get('/budgets');
    return response.data;
  },

  create: async (data: Omit<Budget, 'id' | 'spent'>): Promise<Budget> => {
    if (USE_MOCK) {
      const newBudget = { ...data, id: Math.floor(Math.random() * 10000), spent: 0 };
      mockBudgets.push(newBudget as any);
      return newBudget as any;
    }
    const response = await api.post('/budgets', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Budget>): Promise<Budget> => {
    if (USE_MOCK) {
      const index = mockBudgets.findIndex((b: Budget) => b.id === id);
      mockBudgets[index] = { ...mockBudgets[index], ...data };
      return mockBudgets[index];
    }
    const response = await api.put(`/budgets/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const index = mockBudgets.findIndex((b: Budget) => b.id === id);
      mockBudgets.splice(index, 1);
      return;
    }
    await api.delete(`/budgets/${id}`);
  }
};
