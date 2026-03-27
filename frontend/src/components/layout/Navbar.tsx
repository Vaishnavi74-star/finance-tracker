import React, { useState } from 'react';
import { Menu, Sun, Moon, User as UserIcon, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 lg:h-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-900 sticky top-0 z-30 transition-all">
      <div className="h-full px-4 lg:px-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <button 
            className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition-all"
            onClick={onMenuClick}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-3 md:gap-5 ml-auto">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="relative w-16 h-8 rounded-full bg-gray-200 dark:bg-gray-800 p-1 transition-colors shadow-inner flex items-center"
          >
            <motion.div
              animate={{ x: theme === 'light' ? 0 : 32 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-6 h-6 rounded-full bg-white dark:bg-blue-500 shadow-[0_2px_4px_rgba(0,0,0,0.2)] flex items-center justify-center border border-gray-100 dark:border-blue-400"
            >
              {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-white" />}
            </motion.div>
          </motion.button>
          
          <div className="h-10 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:block text-right">
              <p className="text-sm font-black dark:text-white tracking-tight leading-none">{user?.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase mt-1 tracking-widest">{user?.email}</p>
            </div>
            
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 p-0.5 shadow-sm"
              >
                <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[14px] flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-6 h-6" />
                  )}
                </div>
              </motion.button>
              
              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2.5 z-20"
                    >
                      <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 mb-2 lg:hidden">
                        <p className="text-sm font-black dark:text-white">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/settings');
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4 text-gray-400" /> Account Settings
                      </button>
                      <div className="my-2 border-t border-gray-50 dark:border-gray-800"></div>
                      <button 
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm font-black text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Log Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
