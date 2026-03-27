import React, { useEffect, useState } from 'react';
import { Plus, RefreshCcw, Calendar, Trash2, Edit2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { recurringService } from '../services/recurring.service';
import { categoryService } from '../services/category.service';
import { useAuth } from '../context/AuthContext';
import { RecurringTransaction, Category } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const RecurringTransactions: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const userCurrency = user?.currency || 'INR';
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    nextDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recurringData, categoriesData] = await Promise.all([
        recurringService.getAll(),
        categoryService.getAll()
      ]);
      setItems(recurringData);
      setCategories(categoriesData);
      if (categoriesData.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: categoriesData[0].name }));
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const itemData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        frequency: formData.frequency,
        nextDate: new Date(formData.nextDate).toISOString()
      };

      if (editingItem) {
        await recurringService.update(editingItem.id, itemData);
        toast.success('Recurring transaction updated successfully');
      } else {
        await recurringService.create(itemData);
        toast.success('Recurring transaction added successfully');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        category: categories[0]?.name || '',
        frequency: 'monthly',
        nextDate: format(new Date(), 'yyyy-MM-dd')
      });
      fetchData();
    } catch (error) {
      toast.error(editingItem ? 'Failed to update recurring transaction' : 'Failed to add recurring transaction');
    }
  };

  const handleEdit = (item: RecurringTransaction) => {
    setEditingItem(item);
    setFormData({
      description: item.description,
      amount: item.amount.toString(),
      type: item.type,
      category: item.category,
      frequency: item.frequency,
      nextDate: format(new Date(item.nextDate), 'yyyy-MM-dd')
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this recurring transaction?')) return;
    try {
      await recurringService.delete(id);
      toast.success('Recurring transaction deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete recurring transaction');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Recurring Transactions</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your subscriptions and automated bills.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button onClick={() => { setEditingItem(null); setFormData({ description: '', amount: '', type: 'expense', category: categories[0]?.name || '', frequency: 'monthly', nextDate: format(new Date(), 'yyyy-MM-dd') }); setIsModalOpen(true); }} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Add Recurring
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <RefreshCcw className="w-12 h-12 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">
                No recurring transactions set
              </p>
            </div>
          ) : (
            items.map((item: any, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="group hover:shadow-lg transition-all border-transparent hover:border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                        <RefreshCcw className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{item.description}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">
                            {item.frequency}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Next: {format(new Date(item.nextDate), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount, userCurrency)}
                      </p>
                      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input 
            label="Description" 
            placeholder="e.g. Netflix Subscription" 
            required 
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Amount" 
              type="number" 
              placeholder="15.00" 
              required 
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Next Billing Date" 
              type="date" 
              required 
              value={formData.nextDate}
              onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
            />
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="outline" className="flex-1" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" type="submit">{editingItem ? 'Update Subscription' : 'Add Subscription'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
