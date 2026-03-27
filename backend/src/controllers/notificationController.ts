import { Context } from 'hono';
import prisma from '../client.ts';
import catchAsync from '../utils/catchAsync.ts';
import ApiError from '../utils/ApiError.ts';

export const getNotifications = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  
  // Trigger notification checks before returning
  await checkNotifications(userId);

  const notifications = await prisma.notification.findMany({
    where: { userId, isDeleted: false },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  return c.json(notifications);
});

export const markAsRead = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const id = parseInt(c.req.param('id'));

  const notification = await prisma.notification.findFirst({
    where: { id, userId, isDeleted: false }
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  const updatedNotification = await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });

  return c.json(updatedNotification);
});

export const markAllAsRead = catchAsync(async (c: Context) => {
  const userId = c.get('userId');

  await prisma.notification.updateMany({
    where: { userId, isRead: false, isDeleted: false },
    data: { isRead: true }
  });

  return c.json({ message: 'All notifications marked as read' });
});

export const deleteNotification = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const id = parseInt(c.req.param('id'));

  const notification = await prisma.notification.findFirst({
    where: { id, userId, isDeleted: false }
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  await prisma.notification.update({
    where: { id },
    data: { isDeleted: true }
  });

  return c.json({ message: 'Notification deleted successfully' });
});

// Helper function to check and generate notifications
async function checkNotifications(userId: string) {
  const now = new Date();
  
  // 1. Check Budgets
  const budgets = await prisma.budget.findMany({
    where: { userId, isDeleted: false }
  });

  for (const budget of budgets) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        category: budget.category,
        type: 'expense',
        date: { gte: startOfMonth },
        isDeleted: false
      }
    });

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

    if (totalSpent > budget.limit) {
      // Check if we already notified about this budget exceeding this month
      const existingNotif = await prisma.notification.findFirst({
        where: {
          userId,
          type: 'budget_alert',
          title: `Budget Exceeded: ${budget.category}`,
          createdAt: { gte: startOfMonth },
          isDeleted: false
        }
      });

      if (!existingNotif) {
        await prisma.notification.create({
          data: {
            userId,
            title: `Budget Exceeded: ${budget.category}`,
            message: `You have spent ₹${totalSpent.toFixed(2)}, which exceeds your ${budget.period} budget of ₹${budget.limit.toFixed(2)} for ${budget.category}.`,
            type: 'budget_alert'
          }
        });
      }
    } else if (totalSpent > budget.limit * 0.8) {
      // Check if we already notified about this budget nearing limit this month
      const existingNotif = await prisma.notification.findFirst({
        where: {
          userId,
          type: 'budget_alert',
          title: `Budget Warning: ${budget.category}`,
          createdAt: { gte: startOfMonth },
          isDeleted: false
        }
      });

      if (!existingNotif) {
        await prisma.notification.create({
          data: {
            userId,
            title: `Budget Warning: ${budget.category}`,
            message: `You have reached 80% of your ${budget.period} budget for ${budget.category}. Spent: ₹${totalSpent.toFixed(2)} / ₹${budget.limit.toFixed(2)}.`,
            type: 'budget_alert'
          }
        });
      }
    }
  }

  // 2. Check Savings Goals
  const goals = await prisma.savingsGoal.findMany({
    where: { userId, isDeleted: false }
  });

  for (const goal of goals) {
    if (goal.currentAmount >= goal.targetAmount) {
      const existingNotif = await prisma.notification.findFirst({
        where: {
          userId,
          type: 'goal_milestone',
          title: `Goal Achieved: ${goal.name}`,
          isDeleted: false
        }
      });

      if (!existingNotif) {
        await prisma.notification.create({
          data: {
            userId,
            title: `Goal Achieved: ${goal.name}`,
            message: `Congratulations! You've reached your savings goal of ₹${goal.targetAmount.toFixed(2)} for ${goal.name}.`,
            type: 'goal_milestone'
          }
        });
      }
    }
  }

  // 3. Check Recurring Transactions (due in next 3 days)
  const threeDaysLater = new Date();
  threeDaysLater.setDate(now.getDate() + 3);

  const recurring = await prisma.recurringTransaction.findMany({
    where: {
      userId,
      nextDate: { gte: now, lte: threeDaysLater },
      isDeleted: false
    }
  });

  for (const item of recurring) {
    const existingNotif = await prisma.notification.findFirst({
      where: {
        userId,
        type: 'recurring_reminder',
        title: `Upcoming Payment: ${item.description}`,
        createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }, // last 24h
        isDeleted: false
      }
    });

    if (!existingNotif) {
      await prisma.notification.create({
        data: {
          userId,
          title: `Upcoming Payment: ${item.description}`,
          message: `Your ${item.frequency} ${item.type} of ₹${item.amount.toFixed(2)} for ${item.category} is due on ${item.nextDate.toLocaleDateString()}.`,
          type: 'recurring_reminder'
        }
      });
    }
  }
}
