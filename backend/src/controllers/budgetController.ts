import { Context } from 'hono';
import prisma from '../client.ts';
import catchAsync from '../utils/catchAsync.ts';
import ApiError from '../utils/ApiError.ts';

export const getBudgets = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const budgets = await prisma.budget.findMany({
    where: { userId, isDeleted: false }
  });

  // Calculate spent amount for each budget category
  const transactions = await prisma.transaction.findMany({
    where: { 
      userId, 
      type: 'expense', 
      isDeleted: false,
      date: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    }
  });

  const spentByCategory = transactions.reduce((acc: any, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const budgetsWithSpent = budgets.map(budget => ({
    ...budget,
    spent: spentByCategory[budget.category] || 0
  }));

  return c.json(budgetsWithSpent);
});

export const createBudget = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const { category, limit, period } = body;

  const budget = await prisma.budget.create({
    data: {
      userId,
      category,
      limit: parseFloat(limit),
      period
    }
  });

  return c.json(budget, 201);
});

export const updateBudget = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { limit, period } = body;

  const budget = await prisma.budget.findFirst({
    where: { id, userId, isDeleted: false }
  });

  if (!budget) {
    throw new ApiError(404, 'Budget not found');
  }

  const updatedBudget = await prisma.budget.update({
    where: { id },
    data: {
      limit: limit !== undefined ? parseFloat(limit) : undefined,
      period
    }
  });

  return c.json(updatedBudget);
});

export const deleteBudget = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const id = parseInt(c.req.param('id'));

  const budget = await prisma.budget.findFirst({
    where: { id, userId, isDeleted: false }
  });

  if (!budget) {
    throw new ApiError(404, 'Budget not found');
  }

  await prisma.budget.update({
    where: { id },
    data: { isDeleted: true }
  });

  return c.json({ message: 'Budget deleted successfully' });
});
