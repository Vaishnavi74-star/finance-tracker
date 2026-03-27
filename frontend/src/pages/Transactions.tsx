import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Calendar,
  Coins,
  Receipt
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { transactionService } from '../services/transaction.service';
import { categoryService } from '../services/category.service';
import { Transaction, TransactionType, Category } from '../types';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Transactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const userCurrency = user?.currency || 'INR';

  // Form State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll()
      ]);
      setTransactions(transactionsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setCategories(categoriesData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setAmount('');
    setType('expense');
    setCategory('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setDescription('');
    setEditingTransaction(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const transactionData = {
      amount: parseFloat(amount),
      type,
      category,
      date,
      description
    };

    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, transactionData);
        toast.success('Transaction updated');
      } else {
        await transactionService.create(transactionData);
        toast.success('Transaction added');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setAmount(t.amount.toString());
    setType(t.type);
    setCategory(t.category);
    setDate(format(parseISO(t.date), 'yyyy-MM-dd'));
    setDescription(t.description);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionService.delete(id);
        toast.success('Transaction deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
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
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Transactions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">Track every penny, build your empire.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="h-12 px-6 shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform">
            <Plus className="w-5 h-5 mr-2" /> New Transaction
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex gap-2 ml-auto">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select className="pl-10 pr-8 py-4 bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm outline-none appearance-none dark:text-white shadow-inner min-w-[140px]">
                <option>All Types</option>
                <option>Income</option>
                <option>Expense</option>
              </select>
            </div>
            <Button variant="outline" className="rounded-2xl w-12 h-12 p-0 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100 dark:border-gray-800/50">
                <th className="pb-5 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">Date</th>
                <th className="pb-5 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">Transaction Details</th>
                <th className="pb-5 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">Category</th>
                <th className="pb-5 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] text-right">Amount</th>
                <th className="pb-5 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/30">
              <AnimatePresence mode="popLayout">
                {transactions.length === 0 ? (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Receipt className="w-12 h-12 text-gray-200 dark:text-gray-800" />
                        <p className="text-gray-500 font-bold">No transactions found.</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  transactions.map((t) => (
                    <motion.tr 
                      key={t.id} 
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <td className="py-5 text-sm font-bold text-gray-400">
                        {format(parseISO(t.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                            t.type === 'income' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                          }`}>
                            {t.type === 'income' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-black dark:text-white">{t.description}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{t.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5">
                        <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-5 text-right">
                        <span className={`text-base font-black ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, userCurrency)}
                        </span>
                      </td>
                      <td className="py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(t)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 rounded-xl shadow-sm transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(t.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-gray-800 rounded-xl shadow-sm transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile View Card List */}
        <div className="md:hidden space-y-4">
          <AnimatePresence mode="popLayout">
            {transactions.length === 0 ? (
              <div className="py-10 text-center">
                <Receipt className="w-12 h-12 text-gray-200 dark:text-gray-800 mx-auto mb-2" />
                <p className="text-gray-500 font-bold">No transactions found.</p>
              </div>
            ) : (
              transactions.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {format(parseISO(t.date), 'MMM dd, yyyy')}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(t)} className="p-1.5 text-gray-400 hover:text-blue-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        t.type === 'income' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                      }`}>
                        {t.type === 'income' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-black dark:text-white leading-tight">{t.description}</p>
                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-0.5">{t.category}</p>
                      </div>
                    </div>
                    <span className={`text-base font-black ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, userCurrency)}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? 'Edit Transaction' : 'New Transaction'}
      >
        <form onSubmit={(e: React.FormEvent) => handleSubmit(e)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={(e: React.MouseEvent) => { e.preventDefault(); setType('expense'); }}
              className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                type === 'expense' 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-600 shadow-lg shadow-red-500/10' 
                  : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-200'
              }`}
            >
              <ArrowDownCircle className="w-5 h-5" />
              <span className="font-bold">Expense</span>
            </motion.button>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={(e: React.MouseEvent) => { e.preventDefault(); setType('income'); }}
              className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                type === 'income' 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-600 shadow-lg shadow-green-500/10' 
                  : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-200'
              }`}
            >
              <ArrowUpCircle className="w-5 h-5" />
              <span className="font-bold">Income</span>
            </motion.button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Amount</label>
            <div className="relative">
              <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                required
                step="0.01"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-xl font-black dark:text-white"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
              <select 
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm outline-none dark:text-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Date</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm outline-none dark:text-white"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm outline-none dark:text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <Button variant="outline" className="flex-1 rounded-2xl h-12" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1 rounded-2xl h-12 shadow-xl shadow-blue-500/20" type="submit">
              {editingTransaction ? 'Save Changes' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};