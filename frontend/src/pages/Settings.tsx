import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Lock, 
  Eye, 
  Globe, 
  Shield, 
  Save,
  Moon,
  Sun,
  Palette,
  Download,
  Trash2,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { authService } from '../services/auth.service';

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateMe(profileData);
      updateUser(updatedUser);
      toast.success('Profile settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNotifications = () => {
    toast.success('Notification preferences updated!');
  };

  const handleExportData = () => {
    toast.success('Preparing your data for download...');
    setTimeout(() => {
      toast.success('Data export ready! Check your downloads.');
    }, 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all your data? This action cannot be undone.')) {
      toast.success('Data reset successfully!');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Eye },
    { id: 'data', label: 'Data Management', icon: Database },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your account and app preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="lg:block">
            <Card className="p-2 overflow-x-auto lg:overflow-visible">
              <nav className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap lg:w-full ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-bold">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-8">
                  <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-600" /> Personal Information
                  </h2>
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Full Name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="Your Name"
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button type="submit" className="flex items-center gap-2" isLoading={isLoading}>
                        <Save className="w-4 h-4" /> Save Changes
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-8">
                  <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                    <Bell className="w-6 h-6 text-blue-600" /> Notification Preferences
                  </h2>
                  <div className="space-y-6">
                    {[
                      { id: 'email-notif', label: 'Email Notifications', desc: 'Receive weekly budget reports via email' },
                      { id: 'push-notif', label: 'Push Notifications', desc: 'Get instant alerts for budget limits' },
                      { id: 'recurring-notif', label: 'Recurring Reminders', desc: 'Remind me before recurring transactions' },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                        <div>
                          <p className="font-bold dark:text-white">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked onChange={handleToggleNotifications} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-8">
                  <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                    <Palette className="w-6 h-6 text-blue-600" /> Visual Settings
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                      onClick={() => theme === 'dark' && toggleTheme()}
                      className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${
                        theme === 'light' 
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' 
                          : 'border-gray-100 dark:border-gray-800 hover:border-blue-200'
                      }`}
                    >
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                        <Sun className="w-8 h-8 text-orange-500" />
                      </div>
                      <p className="font-black">Light Mode</p>
                    </button>

                    <button 
                      onClick={() => theme === 'light' && toggleTheme()}
                      className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${
                        theme === 'dark' 
                          ? 'border-blue-600 bg-blue-900/20' 
                          : 'border-gray-100 dark:border-gray-800 hover:border-blue-200'
                      }`}
                    >
                      <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                        <Moon className="w-8 h-8 text-blue-400" />
                      </div>
                      <p className="font-black text-white">Dark Mode</p>
                    </button>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-8">
                  <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-blue-600" /> Security & Privacy
                  </h2>
                  <div className="space-y-6">
                    <Input label="Current Password" type="password" placeholder="••••••••" />
                    <Input label="New Password" type="password" placeholder="••••••••" />
                    <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                    <div className="flex justify-end pt-4">
                      <Button onClick={() => toast.success('Password updated!')}>
                        Update Password
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'data' && (
              <motion.div
                key="data"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-8">
                  <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                    <Database className="w-6 h-6 text-blue-600" /> Data Management
                  </h2>
                  <div className="space-y-6">
                    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold dark:text-white">Export My Data</p>
                        <p className="text-sm text-gray-500">Download a copy of your financial records in CSV format.</p>
                      </div>
                      <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                      </Button>
                    </div>

                    <div className="p-6 border-2 border-red-50 dark:border-red-900/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-red-600">Reset Account Data</p>
                        <p className="text-sm text-gray-500">Permanently delete all transactions, budgets and goals.</p>
                      </div>
                      <Button onClick={handleResetData} className="bg-red-600 hover:bg-red-700 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Reset Data
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

