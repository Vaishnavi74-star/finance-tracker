import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/authMiddleware.ts';
import * as transactionController from '../controllers/transactionController.ts';
import * as budgetController from '../controllers/budgetController.ts';
import * as goalController from '../controllers/goalController.ts';
import * as recurringController from '../controllers/recurringController.ts';
import * as categoryController from '../controllers/categoryController.ts';
import * as notificationController from '../controllers/notificationController.ts';

const appRoutes = new Hono();

appRoutes.use('/*', authMiddleware);

// Transactions
appRoutes.get('/transactions', transactionController.getTransactions);
appRoutes.post('/transactions', transactionController.createTransaction);
appRoutes.put('/transactions/:id', transactionController.updateTransaction);
appRoutes.delete('/transactions/:id', transactionController.deleteTransaction);

// Budgets
appRoutes.get('/budgets', budgetController.getBudgets);
appRoutes.post('/budgets', budgetController.createBudget);
appRoutes.put('/budgets/:id', budgetController.updateBudget);
appRoutes.delete('/budgets/:id', budgetController.deleteBudget);

// Goals
appRoutes.get('/goals', goalController.getGoals);
appRoutes.post('/goals', goalController.createGoal);
appRoutes.put('/goals/:id', goalController.updateGoal);
appRoutes.delete('/goals/:id', goalController.deleteGoal);

// Recurring
appRoutes.get('/recurring', recurringController.getRecurring);
appRoutes.post('/recurring', recurringController.createRecurring);
appRoutes.put('/recurring/:id', recurringController.updateRecurring);
appRoutes.delete('/recurring/:id', recurringController.deleteRecurring);

// Categories
appRoutes.get('/categories', categoryController.getCategories);
appRoutes.post('/categories', categoryController.createCategory);
appRoutes.put('/categories/:id', categoryController.updateCategory);
appRoutes.delete('/categories/:id', categoryController.deleteCategory);

// Notifications
appRoutes.get('/notifications', notificationController.getNotifications);
appRoutes.patch('/notifications/read-all', notificationController.markAllAsRead);
appRoutes.patch('/notifications/:id/read', notificationController.markAsRead);
appRoutes.delete('/notifications/:id', notificationController.deleteNotification);

export default appRoutes;
