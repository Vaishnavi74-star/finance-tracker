import React, { useEffect, useState } from 'react';
import { Plus, AlertTriangle, CheckCircle, TrendingUp, Coins, MoreHorizontal } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { budgetService } from '../services/budget.service';
import { categoryService } from '../services/category.service';
import { useAuth } from '../context/AuthContext';
import { Budget, Category } from '../types';
import toast from 'react-hot-toast';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Budgets: React.FC = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const userCurrency = user?.currency || 'INR';
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly' as 'monthly' | 'weekly'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [budgetsData, categoriesData] = await Promise.all([
        budgetService.getAll(),
        categoryService.getAll()
      ]);
      setBudgets(budgetsData);
      setCategories(categoriesData);
      if (categoriesData.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: categoriesData[0].name }));
      } else if (!formData.category) {
        setFormData(prev => ({ ...prev, category: 'Food' }));
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
      if (editingBudget) {
        await budgetService.update(editingBudget.id, {
          limit: parseFloat(formData.limit),
          period: formData.period
        });
        toast.success('Budget updated successfully');
      } else {
        await budgetService.create({
          category: formData.category,
          limit: parseFloat(formData.limit),
          period: formData.period
        });
        toast.success('Budget created successfully');
      }
      setIsModalOpen(false);
      setEditingBudget(null);
      setFormData({ category: categories[0]?.name || 'Food', limit: '', period: 'monthly' });
      fetchData();
    } catch (error) {
      toast.error(editingBudget ? 'Failed to update budget' : 'Failed to create budget');
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      limit: budget.limit.toString(),
      period: budget.period as any
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await budgetService.delete(id);
      toast.success('Budget deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const calculateProgress = (spent: number, limit: number) => {
    return Math.min(Math.round((spent / limit) * 100), 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Budgets</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Plan your spending and save more every month.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Button onClick={() => { setEditingBudget(null); setFormData({ category: categories[0]?.name || 'Food', limit: '', period: 'monthly' }); setIsModalOpen(true); }} className="w-full sm:w-auto h-12 px-6 shadow-lg shadow-blue-500/20">
              <Plus className="w-5 h-5 mr-2" /> New Budget Limit
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {budgets.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="col-span-full py-20 text-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-lg font-black dark:text-white">
                    No budgets set
                  </p>
                  <p className="text-gray-500 font-medium max-w-xs mt-1">
                    Start tracking your expenses by setting up a monthly budget.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            budgets.map((budget: any, idx) => {
              const progress = calculateProgress(budget.spent, budget.limit);
              const isOver = budget.spent > budget.limit;
              const isWarning = progress >= 85 && !isOver;

              return (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className={`relative overflow-hidden border-none shadow-xl transition-all duration-300 ${
                    isOver ? 'ring-2 ring-red-500/50' : isWarning ? 'ring-2 ring-amber-500/50' : 'hover:ring-2 hover:ring-blue-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                          isOver ? 'bg-red-100 text-red-600' : isWarning ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          <Coins className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-black text-gray-900 dark:text-white text-lg leading-tight">{budget.category}</h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{budget.period} limit</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(budget)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-3xl font-black dark:text-white leading-none">{formatCurrency(budget.spent, userCurrency)}</span>
                          <span className="text-gray-400 text-sm font-bold ml-1"> / {formatCurrency(budget.limit, userCurrency)}</span>
                        </div>
                        <span className={`text-sm font-black px-2 py-1 rounded-lg ${
                          isOver ? 'bg-red-100 text-red-600' : isWarning ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {progress}%
                        </span>
                      </div>

                      <div className="relative h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-1 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full shadow-lg ${
                            isOver ? 'bg-gradient-to-r from-red-500 to-red-600' : isWarning ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          }`}
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        {isOver ? (
                          <div className="flex items-center gap-1.5 text-red-600 text-[10px] font-black uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">
                            <AlertTriangle className="w-3.5 h-3.5" /> Over Budget
                          </div>
                        ) : isWarning ? (
                          <div className="flex items-center gap-1.5 text-amber-600 text-[10px] font-black uppercase tracking-widest bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                            <AlertTriangle className="w-3.5 h-3.5" /> Near Limit
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-green-600 text-[10px] font-black uppercase tracking-widest bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                            <CheckCircle className="w-3.5 h-3.5" /> Healthy Spending
                          </div>
                        )}
                        <button 
                          onClick={() => handleDelete(budget.id)}
                          className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? 'Update Budget' : 'Setup Budget'}
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
            <select 
              className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm outline-none dark:text-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={!!editingBudget}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Limit</label>
              <input 
                type="number" 
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-black text-lg outline-none dark:text-white"
                placeholder="0.00" 
                required 
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Frequency</label>
              <select 
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm outline-none dark:text-white"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <Button variant="outline" className="flex-1 rounded-2xl h-12" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1 rounded-2xl h-12 shadow-xl shadow-blue-500/20" type="submit">{editingBudget ? 'Save Changes' : 'Create Budget'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
