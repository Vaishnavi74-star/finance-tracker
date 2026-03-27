import api from '../lib/api';
import { AuthResponse, User } from '../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: { id: '1', email, name: 'John Doe' }
      };
    }
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: { id: '1', email, name }
      };
    }
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    if (USE_MOCK) {
      return { id: '1', email: 'john@example.com', name: 'John Doe', currency: 'INR' };
    }
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  updateMe: async (data: Partial<User>): Promise<User> => {
    if (USE_MOCK) {
      return { id: '1', email: 'john@example.com', name: 'John Doe', currency: 'INR', ...data };
    }
    const response = await api.patch('/auth/me', data);
    return response.data.user;
  },
};
