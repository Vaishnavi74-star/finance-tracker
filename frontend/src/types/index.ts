export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  currency?: string;
}

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  description: string;
  recurringId?: number;
}

export interface Budget {
  id: number;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly';
}

export interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
}

export interface RecurringTransaction {
  id: number;
  amount: number;
  type: TransactionType;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
  description: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'budget_alert' | 'goal_milestone' | 'recurring_reminder' | 'general';
  isRead: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
