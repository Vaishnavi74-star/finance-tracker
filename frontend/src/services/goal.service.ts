import api from '../lib/api';
import { SavingsGoal } from '../types';
import { mockGoals } from '../data/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const goalService = {
  getAll: async (): Promise<SavingsGoal[]> => {
    if (USE_MOCK) {
      return [...mockGoals];
    }
    const response = await api.get('/goals');
    return response.data;
  },

  create: async (data: Omit<SavingsGoal, 'id'>): Promise<SavingsGoal> => {
    if (USE_MOCK) {
      const newGoal = { ...data, id: Math.floor(Math.random() * 10000) };
      mockGoals.push(newGoal as any);
      return newGoal as any;
    }
    const response = await api.post('/goals', data);
    return response.data;
  },

  update: async (id: number, data: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    if (USE_MOCK) {
      const index = mockGoals.findIndex((g: SavingsGoal) => g.id === id);
      mockGoals[index] = { ...mockGoals[index], ...data };
      return mockGoals[index];
    }
    const response = await api.put(`/goals/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const index = mockGoals.findIndex((g: SavingsGoal) => g.id === id);
      mockGoals.splice(index, 1);
      return;
    }
    await api.delete(`/goals/${id}`);
  }
};
