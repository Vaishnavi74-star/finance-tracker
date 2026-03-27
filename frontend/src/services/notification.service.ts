import api from '../lib/api';
import { Notification } from '../types';

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
};
