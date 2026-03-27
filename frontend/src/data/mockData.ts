import { Transaction, Budget, SavingsGoal, RecurringTransaction, Category } from '../types';
import { subMonths, format, startOfMonth } from 'date-fns';

export const mockCategories: Category[] = [
  { id: 1, name: 'Food', icon: 'Utensils', color: '#EF4444' },
  { id: 2, name: 'Rent', icon: 'Home', color: '#3B82F6' },
  { id: 3, name: 'Salary', icon: 'IndianRupee', color: '#10B981' },
  { id: 4, name: 'Entertainment', icon: 'Film', color: '#8B5CF6' },
  { id: 5, name: 'Shopping', icon: 'ShoppingBag', color: '#F59E0B' },
  { id: 6, name: 'Transport', icon: 'Car', color: '#6B7280' },
  { id: 7, name: 'Bills', icon: 'FileText', color: '#EC4899' },
  { id: 8, name: 'Healthcare', icon: 'Heart', color: '#14B8A6' },
];

const generateMonthlyData = () => {
  const transactions: Transaction[] = [];
  let id = 1;

  for (let i = 0; i < 6; i++) {
    const date = subMonths(new Date(), i);
    const dateStr = (d: Date) => format(d, 'yyyy-MM-dd');
    const monthStart = startOfMonth(date);
    
    // Income
    transactions.push({
      id: id++,
      amount: 45000 + Math.random() * 15000,
      type: 'income',
      category: 'Salary',
      date: dateStr(new Date(monthStart.getFullYear(), monthStart.getMonth(), 1)),
      description: 'Monthly Salary'
    });

    if (Math.random() > 0.6) {
      transactions.push({
        id: id++,
        amount: 5000 + Math.random() * 5000,
        type: 'income',
        category: 'Bonus',
        date: dateStr(new Date(monthStart.getFullYear(), monthStart.getMonth(), 15)),
        description: 'Performance Bonus'
      });
    }

    // Expenses
    transactions.push({
      id: id++,
      amount: 15000,
      type: 'expense',
      category: 'Rent',
      date: dateStr(new Date(monthStart.getFullYear(), monthStart.getMonth(), 2)),
      description: 'Monthly Rent'
    });

    transactions.push({
      id: id++,
      amount: 2000 + Math.random() * 2000,
      type: 'expense',
      category: 'Bills',
      date: dateStr(new Date(monthStart.getFullYear(), monthStart.getMonth(), 5)),
      description: 'Utility Bills'
    });

    for (let j = 0; j < 5; j++) {
      transactions.push({
        id: id++,
        amount: 800 + Math.random() * 2000,
        type: 'expense',
        category: 'Food',
        date: dateStr(new Date(monthStart.getFullYear(), monthStart.getMonth(), 7 + j * 4)),
        description: 'Groceries/Dining'
      });
    }

    transactions.push({
      id: id++,
      amount: 1500 + Math.random() * 5000,
      type: 'expense',
      category: 'Shopping',
      date: dateStr(new Date(monthStart.getFullYear(), monthStart.getMonth(), 22)),
      description: 'Fashion & Tech'
    });

    transactions.push({
      id: id++,
      amount: 1200 + Math.random() * 1500,
      type: 'expense',
      category: 'Transport',
      date: dateStr(new Date(monthStart.getFullYear(), monthStart.getMonth(), 26)),
      description: 'Commute/Travel'
    });
  }

  return transactions;
};

export const mockTransactions: Transaction[] = generateMonthlyData();

export const mockBudgets: Budget[] = [
  { id: 1, category: 'Food', limit: 8000, spent: 6500, period: 'monthly' },
  { id: 2, category: 'Entertainment', limit: 4000, spent: 1500, period: 'monthly' },
  { id: 3, category: 'Shopping', limit: 10000, spent: 12000, period: 'monthly' },
  { id: 4, category: 'Transport', limit: 5000, spent: 4200, period: 'monthly' },
];

export const mockGoals: SavingsGoal[] = [
  { id: 1, name: 'Emergency Fund', targetAmount: 500000, currentAmount: 150000, deadline: '2026-12-31', icon: 'Shield' },
  { id: 2, name: 'New Car', targetAmount: 1500000, currentAmount: 200000, deadline: '2027-06-30', icon: 'Car' },
  { id: 3, name: 'European Vacation', targetAmount: 300000, currentAmount: 85000, deadline: '2026-09-15', icon: 'Plane' },
];

export const mockRecurring: RecurringTransaction[] = [
  { id: 1, amount: 999, type: 'expense', category: 'Entertainment', frequency: 'monthly', nextDate: '2026-03-01', description: 'Netflix Premium' },
  { id: 2, amount: 15000, type: 'expense', category: 'Rent', frequency: 'monthly', nextDate: '2026-03-01', description: 'Monthly Rent' },
  { id: 3, amount: 2500, type: 'expense', category: 'Bills', frequency: 'monthly', nextDate: '2026-03-10', description: 'Internet' },
];
