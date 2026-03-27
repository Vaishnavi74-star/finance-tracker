import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, LayoutGrid, Utensils, Home, Coins, Film, ShoppingBag, Car, FileText, Heart, Wallet, Bus, Coffee, Gift, Dumbbell, Zap } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { categoryService } from '../services/category.service';
import { transactionService } from '../services/transaction.service';
import { useAuth } from '../context/AuthContext';
import { Category, Transaction } from '../types';
import toast from 'react-hot-toast';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ICON_MAP: Record<string, React.ReactNode> = {
  Utensils: <Utensils className="w-6 h-6" />,
  Home: <Home className="w-6 h-6" />,
  Coins: <Coins className="w-6 h-6" />,
  Film: <Film className="w-6 h-6" />,
  ShoppingBag: <ShoppingBag className="w-6 h-6" />,
  Car: <Car className="w-6 h-6" />,
  FileText: <FileText className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />,
  Wallet: <Wallet className="w-6 h-6" />,
  Bus: <Bus className="w-6 h-6" />,
  Coffee: <Coffee className="w-6 h-6" />,
  Gift: <Gift className="w-6 h-6" />,
  Dumbbell: <Dumbbell className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  LayoutGrid: <LayoutGrid className="w-6 h-6" />,
};

export const Categories: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const userCurrency = user?.currency || 'INR';
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    icon: 'LayoutGrid'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesData, transactionsData] = await Promise.all([
        categoryService.getAll(),
        transactionService.getAll()
      ]);
      setCategories(categoriesData);
      setTransactions(transactionsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        stats[t.category] = (stats[t.category] || 0) + t.amount;
      }
    });
    return stats;
  }, [transactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await categoryService.create(formData);
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', color: '#3B82F6', icon: 'LayoutGrid' });
      fetchData();
    } catch (error) {
      toast.error(editingCategory ? 'Failed to update category' : 'Failed to create category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryService.delete(id);
      toast.success('Category deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Categories</h1>
          <p className="text-gray-500 dark:text-gray-400">Organize your finances with custom categories.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button onClick={() => { setEditingCategory(null); setFormData({ name: '', color: '#3B82F6', icon: 'LayoutGrid' }); setIsModalOpen(true); }} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {categories.map((category) => (
            <motion.div
              key={category.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 border-transparent hover:border-blue-500/30">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-inner"
                    style={{ backgroundColor: category.color }}
                  >
                    {ICON_MAP[category.icon] || <LayoutGrid className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{category.name}</h3>
                    <p className="text-xs text-gray-500 font-bold tracking-tight">
                      Total: <span className="text-red-500">{formatCurrency(categoryStats[category.name] || 0, userCurrency)}</span>
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(category)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input 
            label="Category Name" 
            placeholder="e.g. Travel" 
            required 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.keys(ICON_MAP).map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: iconName })}
                  className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                    formData.icon === iconName 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {React.cloneElement(ICON_MAP[iconName] as React.ReactElement<any>, { className: 'w-5 h-5' })}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
            <div className="flex flex-wrap gap-2">
              {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#6366F1', '#EC4899', '#6B7280', '#14B8A6', '#F43F5E'].map((color) => (
                <button 
                  key={color}
                  type="button" 
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${formData.color === color ? 'border-gray-900 dark:border-white scale-110' : 'border-white dark:border-gray-900'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="outline" className="flex-1" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" type="submit">{editingCategory ? 'Update Category' : 'Create Category'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
