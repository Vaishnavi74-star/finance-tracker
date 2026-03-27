import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  Target, 
  RefreshCcw, 
  Settings,
  X,
  PieChart,
  ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Receipt, label: 'Transactions', path: '/transactions' },
  { icon: Wallet, label: 'Budgets', path: '/budgets' },
  { icon: Target, label: 'Savings Goals', path: '/goals' },
  { icon: RefreshCcw, label: 'Recurring', path: '/recurring' },
  { icon: PieChart, label: 'Categories', path: '/categories' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={clsx(
        "fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-900 z-50 transition-all duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center justify-between px-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                SmartFinance
              </span>
            </div>
            <button className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" onClick={onClose}>
              <X className="w-6 h-6 dark:text-white" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) => clsx(
                  "group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 relative",
                  isActive 
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-900/50 hover:translate-x-1"
                )}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3.5">
                      <item.icon className={clsx("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600")} />
                      <span className="font-bold tracking-tight">{item.label}</span>
                    </div>
                    {isActive && (
                      <motion.div layoutId="active-nav" className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                    )}
                    <ChevronRight className={clsx("w-4 h-4 opacity-0 transition-all duration-200", !isActive && "group-hover:opacity-100 group-hover:translate-x-1")} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 mt-auto">
            <NavLink
              to="/settings"
              className="flex items-center gap-3 px-4 py-3.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition-all hover:translate-x-1"
            >
              <Settings className="w-5 h-5" />
              <span className="font-bold tracking-tight text-sm">Settings</span>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};
