import api from '../lib/api';
import { Transaction } from '../types';
import { mockTransactions } from '../data/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const transactionService = {
  getAll: async (): Promise<Transaction[]> => {
    if (USE_MOCK) {
      return [...mockTransactions];
    }
    const response = await api.get('/transactions');
    return response.data;
  },

  create: async (data: Omit<Transaction, 'id'>): Promise<Transaction> => {
    if (USE_MOCK) {
      const newTransaction = { ...data, id: Math.floor(Math.random() * 10000) };
      mockTransactions.push(newTransaction as any);
      return newTransaction as any;
    }
    const response = await api.post('/transactions', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Transaction>): Promise<Transaction> => {
    if (USE_MOCK) {
      const index = mockTransactions.findIndex((t: Transaction) => t.id === id);
      mockTransactions[index] = { ...mockTransactions[index], ...data };
      return mockTransactions[index];
    }
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const index = mockTransactions.findIndex((t: Transaction) => t.id === id);
      mockTransactions.splice(index, 1);
      return;
    }
    await api.delete(`/transactions/${id}`);
  }
};
