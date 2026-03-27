import React, { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Receipt
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  PointElement, 
  LineElement, 
  Filler 
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { transactionService } from '../services/transaction.service';
import { Transaction } from '../types';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
} as any;

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const userCurrency = user?.currency || 'INR';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await transactionService.getAll();
        setTransactions(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const { totalIncome, totalExpense, totalSavings, barData, pieData } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = income - expense;

    // Monthly Data (Last 6 months)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: format(date, 'MMM'),
        start: startOfMonth(date),
        end: endOfMonth(date),
        income: 0,
        expense: 0
      };
    });

    transactions.forEach(t => {
      const tDate = parseISO(t.date);
      last6Months.forEach(m => {
        if (isWithinInterval(tDate, { start: m.start, end: m.end })) {
          if (t.type === 'income') m.income += t.amount;
          else m.expense += t.amount;
        }
      });
    });

    const bData = {
      labels: last6Months.map(m => m.month),
      datasets: [
        {
          label: 'Income',
          data: last6Months.map(m => m.income),
          backgroundColor: '#10B981',
          borderRadius: 8,
          hoverBackgroundColor: '#059669',
        },
        {
          label: 'Expense',
          data: last6Months.map(m => m.expense),
          backgroundColor: '#EF4444',
          borderRadius: 8,
          hoverBackgroundColor: '#DC2626',
        },
      ],
    };

    // Category-wise expense (Current Month)
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());
    
    const expenseByCategory = transactions
      .filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), { start: currentMonthStart, end: currentMonthEnd }))
      .reduce((acc: any, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    const pData = {
      labels: Object.keys(expenseByCategory).length > 0 ? Object.keys(expenseByCategory) : ['No Data'],
      datasets: [
        {
          data: Object.values(expenseByCategory).length > 0 ? Object.values(expenseByCategory) : [1],
          backgroundColor: [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#6366F1', '#EC4899'
          ],
          borderWidth: 0,
          hoverOffset: 20
        },
      ],
    };

    return { 
      totalIncome: income, 
      totalExpense: expense, 
      totalSavings: savings, 
      barData: bData, 
      pieData: pData 
    };
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-white dark:bg-gray-900 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Financial Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Smart tracking for your financial freedom.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button size="sm" onClick={() => navigate('/transactions')} className="flex-1 sm:flex-none hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          variants={itemVariants} 
          whileHover={{ 
            y: -10, 
            rotateX: 2, 
            rotateY: -2,
            transition: { duration: 0.2 }
          }} 
          className="perspective-1000"
        >
          <Card className="border-none shadow-xl bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-900/10 transform-gpu transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Total Income</p>
                <h3 className="text-3xl font-black dark:text-white mt-1">{formatCurrency(totalIncome, userCurrency)}</h3>
              </div>
              <div className="p-4 bg-green-500 text-white rounded-2xl shadow-lg shadow-green-500/30">
                <ArrowUpRight className="w-8 h-8" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          whileHover={{ 
            y: -10, 
            rotateX: 2, 
            rotateY: 2,
            transition: { duration: 0.2 }
          }} 
          className="perspective-1000"
        >
          <Card className="border-none shadow-xl bg-gradient-to-br from-white to-red-50/30 dark:from-gray-900 dark:to-red-900/10 transform-gpu transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Total Expenses</p>
                <h3 className="text-3xl font-black dark:text-white mt-1">{formatCurrency(totalExpense, userCurrency)}</h3>
              </div>
              <div className="p-4 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/30">
                <ArrowDownRight className="w-8 h-8" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          whileHover={{ 
            y: -10, 
            rotateX: 2, 
            rotateY: 0,
            transition: { duration: 0.2 }
          }} 
          className="perspective-1000"
        >
          <Card className="border-none shadow-xl bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10 transform-gpu transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Net Balance</p>
                <h3 className="text-3xl font-black dark:text-white mt-1">{formatCurrency(totalSavings, userCurrency)}</h3>
              </div>
              <div className="p-4 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/30">
                <Wallet className="w-8 h-8" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants}>
          <Card title="Cash Flow" subtitle="Monthly income vs expenses" className="shadow-2xl border-none">
            <div className="h-80">
              <Bar 
                data={barData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                  },
                  plugins: { 
                    legend: { 
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { family: 'Inter', size: 12, weight: 'bold' }
                      }
                    },
                    tooltip: {
                      padding: 12,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleFont: { size: 14, weight: 'bold' },
                      bodyFont: { size: 13 },
                      callbacks: {
                        label: (context) => {
                          let label = context.dataset.label || '';
                          if (label) label += ': ';
                          if (context.parsed.y !== null) label += formatCurrency(context.parsed.y, userCurrency);
                          return label;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { font: { weight: 'bold' } }
                    },
                    y: {
                      border: { dash: [4, 4] },
                      ticks: {
                        callback: (value) => formatCurrency(value as number, userCurrency),
                        font: { size: 10 }
                      }
                    }
                  }
                }} 
              />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card title="Spending Analysis" subtitle="Expense breakdown for this month" className="shadow-2xl border-none">
            <div className="h-80 flex items-center justify-center">
              <div className="w-full h-full max-w-[320px]">
                <Pie 
                  data={pieData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    animation: {
                      animateRotate: true,
                      animateScale: true,
                      duration: 2000
                    },
                    plugins: { 
                      legend: { 
                        position: 'bottom',
                        labels: {
                          usePointStyle: true,
                          padding: 15,
                          font: { size: 11 }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.parsed;
                            return ` ${label}: ${formatCurrency(value, userCurrency)}`;
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card title="Recent Transactions" className="shadow-2xl border-none overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="pb-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Transaction</th>
                  <th className="pb-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Category</th>
                  <th className="pb-4 font-bold text-xs text-gray-400 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500 font-medium">
                      No transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.slice(0, 5).map((t, idx) => (
                    <motion.tr 
                      key={t.id} 
                      className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <td className="py-5 text-sm text-gray-500">
                        {format(parseISO(t.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-5">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{t.description}</p>
                        </div>
                      </td>
                      <td className="py-5">
                        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-tighter rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 transition-colors">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-5 text-right">
                        <span className={`text-sm font-black ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, userCurrency)}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-3">
            {transactions.length === 0 ? (
              <p className="py-8 text-center text-gray-500 font-medium">No transactions recorded yet.</p>
            ) : (
              transactions.slice(0, 5).map((t, idx) => (
                <motion.div 
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-8 rounded-full ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-sm font-bold dark:text-white leading-tight">{t.description}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{t.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, userCurrency)}
                    </p>
                    <p className="text-[10px] text-gray-400">{format(parseISO(t.date), 'MMM dd')}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          <div className="mt-6 flex justify-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')} className="text-blue-600 font-bold hover:bg-blue-50">
              Explore All Transactions
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
