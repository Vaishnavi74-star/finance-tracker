import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Budgets } from './pages/Budgets';
import { SavingsGoals } from './pages/SavingsGoals';
import { RecurringTransactions } from './pages/RecurringTransactions';
import { Categories } from './pages/Categories';
import { Settings } from './pages/Settings';
import { DashboardLayout } from './components/layout/DashboardLayout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/transactions" element={
        <ProtectedRoute>
          <Transactions />
        </ProtectedRoute>
      } />

      <Route path="/budgets" element={
        <ProtectedRoute>
          <Budgets />
        </ProtectedRoute>
      } />

      <Route path="/goals" element={
        <ProtectedRoute>
          <SavingsGoals />
        </ProtectedRoute>
      } />

      <Route path="/recurring" element={
        <ProtectedRoute>
          <RecurringTransactions />
        </ProtectedRoute>
      } />

      <Route path="/categories" element={
        <ProtectedRoute>
          <Categories />
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppRoutes />
          <Toaster position="top-right" />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
