import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Target, 
  Calendar, 
  TrendingUp, 
  Shield, 
  Car, 
  Home, 
  Plane, 
  Trash2, 
  Edit2, 
  PlusCircle, 
  Coins
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { goalService } from '../services/goal.service';
import { useAuth } from '../context/AuthContext';
import { SavingsGoal } from '../types';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const icons: Record<string, any> = { Shield, Car, Home, Plane, Target };

export const SavingsGoals: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const userCurrency = user?.currency || 'INR';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    icon: 'Target'
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await goalService.getAll();
      setGoals(data);
    } catch (error) {
      toast.error('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const goalData = {
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
        deadline: new Date(formData.deadline).toISOString(),
        icon: formData.icon
      };

      if (editingGoal) {
        await goalService.update(editingGoal.id, goalData);
        toast.success('Goal updated successfully');
      } else {
        await goalService.create(goalData);
        toast.success('Goal created successfully');
      }
      setIsModalOpen(false);
      setEditingGoal(null);
      setFormData({ name: '', targetAmount: '', currentAmount: '0', deadline: '', icon: 'Target' });
      fetchGoals();
    } catch (error) {
      toast.error(editingGoal ? 'Failed to update goal' : 'Failed to create goal');
    }
  };

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: format(parseISO(goal.deadline), 'yyyy-MM-dd'),
      icon: goal.icon
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await goalService.delete(id);
      toast.success('Goal deleted successfully');
      fetchGoals();
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const handleAddSavings = async (goal: SavingsGoal) => {
    const amountStr = window.prompt(`How much would you like to add to "${goal.name}"?`);
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    try {
      await goalService.update(goal.id, {
        ...goal,
        currentAmount: goal.currentAmount + amount
      });
      toast.success('Savings added!');
      fetchGoals();
    } catch (error) {
      toast.error('Failed to add savings');
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
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
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Savings Goals</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Dream big and save for what matters to you.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Button onClick={() => { setEditingGoal(null); setFormData({ name: '', targetAmount: '', currentAmount: '0', deadline: '', icon: 'Target' }); setIsModalOpen(true); }} className="w-full sm:w-auto h-12 px-6 shadow-lg shadow-blue-500/20">
              <Plus className="w-5 h-5 mr-2" /> Start New Goal
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {goals.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="col-span-full py-20 text-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                  <Target className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-lg font-black dark:text-white">
                    No savings goals set
                  </p>
                  <p className="text-gray-500 font-medium max-w-xs mt-1">
                    Dream big and start saving for what matters.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            goals.map((goal: any, idx) => {
              const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
              const Icon = icons[goal.icon] || Target;
              const isCompleted = progress >= 100;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Card className="relative overflow-hidden border-none shadow-xl bg-white dark:bg-gray-900 group-hover:shadow-2xl transition-all duration-300">
                    {isCompleted && (
                      <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest shadow-lg z-10">
                        Goal Reached
                      </div>
                    )}
                    
                    <div className="flex items-center gap-5 mb-8">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6 ${
                        isCompleted ? 'bg-green-100 text-green-600 shadow-green-500/10' : 'bg-blue-100 text-blue-600 shadow-blue-500/10'
                      }`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 dark:text-white text-xl leading-tight">{goal.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>Target: {format(parseISO(goal.deadline), 'MMM yyyy')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Saved Amount</p>
                          <span className={`text-3xl font-black leading-none ${isCompleted ? 'text-green-600' : 'dark:text-white'}`}>
                            {formatCurrency(goal.currentAmount, userCurrency)}
                          </span>
                          <p className="text-gray-400 text-sm font-bold mt-1">of {formatCurrency(goal.targetAmount, userCurrency)}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xl font-black ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                            {progress}%
                          </span>
                        </div>
                      </div>

                      <div className="relative h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-1 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={`h-full rounded-full shadow-lg ${
                            isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          }`}
                        />
                      </div>

                      <div className="pt-4 flex gap-2">
                        <Button className="flex-1 rounded-xl font-black text-xs uppercase tracking-widest h-11" size="sm" onClick={() => handleAddSavings(goal)}>
                          <PlusCircle className="w-4 h-4 mr-2" /> Add Money
                        </Button>
                        <button 
                          onClick={() => handleEdit(goal)}
                          className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-blue-600 rounded-xl transition-all hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(goal.id)}
                          className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 rounded-xl transition-all hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
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
        title={editingGoal ? 'Update Goal' : 'Start Goal'}
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">What are you saving for?</label>
            <input 
              className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm outline-none dark:text-white"
              placeholder="e.g. Dream House, New Car, World Trip" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Target</label>
              <input 
                type="number" 
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-black text-lg outline-none dark:text-white"
                placeholder="0.00" 
                required 
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Starting</label>
              <input 
                type="number" 
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-black text-lg outline-none dark:text-white"
                placeholder="0" 
                value={formData.currentAmount}
                onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Target Date</label>
            <input 
              type="date" 
              required 
              className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm outline-none dark:text-white"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Choose Icon</label>
            <div className="flex justify-between gap-2">
              {['Shield', 'Car', 'Home', 'Plane', 'Target'].map((iconName) => {
                const IconComp = icons[iconName];
                return (
                  <button 
                    key={iconName}
                    type="button" 
                    onClick={() => setFormData({ ...formData, icon: iconName })}
                    className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center ${
                      formData.icon === iconName 
                        ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-lg shadow-blue-500/10' 
                        : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <IconComp className="w-6 h-6" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <Button variant="outline" className="flex-1 rounded-2xl h-12" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1 rounded-2xl h-12 shadow-xl shadow-blue-500/20" type="submit">{editingGoal ? 'Save Changes' : 'Start Saving'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
