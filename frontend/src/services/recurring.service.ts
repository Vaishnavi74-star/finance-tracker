import api from '../lib/api';
import { RecurringTransaction } from '../types';
import { mockRecurring } from '../data/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const recurringService = {
  getAll: async (): Promise<RecurringTransaction[]> => {
    if (USE_MOCK) {
      return [...mockRecurring];
    }
    const response = await api.get('/recurring');
    return response.data;
  },

  create: async (data: Omit<RecurringTransaction, 'id'>): Promise<RecurringTransaction> => {
    if (USE_MOCK) {
      const newRecurring = { ...data, id: Math.floor(Math.random() * 10000) };
      mockRecurring.push(newRecurring as any);
      return newRecurring as any;
    }
    const response = await api.post('/recurring', data);
    return response.data;
  },

  update: async (id: number, data: Partial<RecurringTransaction>): Promise<RecurringTransaction> => {
    if (USE_MOCK) {
      const index = mockRecurring.findIndex((r: RecurringTransaction) => r.id === id);
      mockRecurring[index] = { ...mockRecurring[index], ...data };
      return mockRecurring[index];
    }
    const response = await api.put(`/recurring/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const index = mockRecurring.findIndex((r: RecurringTransaction) => r.id === id);
      mockRecurring.splice(index, 1);
      return;
    }
    await api.delete(`/recurring/${id}`);
  }
};
