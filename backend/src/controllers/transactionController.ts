import { Context } from 'hono';
import prisma from '../client.ts';
import catchAsync from '../utils/catchAsync.ts';
import ApiError from '../utils/ApiError.ts';

export const getTransactions = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const transactions = await prisma.transaction.findMany({
    where: { userId, isDeleted: false },
    orderBy: { date: 'desc' }
  });
  return c.json(transactions);
});

export const createTransaction = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const { amount, type, category, date, description, recurringId } = body;

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date(date),
      description,
      recurringId: recurringId ? parseInt(recurringId) : null
    }
  });

  return c.json(transaction, 201);
});

export const updateTransaction = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { amount, type, category, date, description } = body;

  const transaction = await prisma.transaction.findFirst({
    where: { id, userId, isDeleted: false }
  });

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  const updatedTransaction = await prisma.transaction.update({
    where: { id },
    data: {
      amount: amount !== undefined ? parseFloat(amount) : undefined,
      type,
      category,
      date: date ? new Date(date) : undefined,
      description
    }
  });

  return c.json(updatedTransaction);
});

export const deleteTransaction = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const id = parseInt(c.req.param('id'));

  const transaction = await prisma.transaction.findFirst({
    where: { id, userId, isDeleted: false }
  });

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  await prisma.transaction.update({
    where: { id },
    data: { isDeleted: true }
  });

  return c.json({ message: 'Transaction deleted successfully' });
});
