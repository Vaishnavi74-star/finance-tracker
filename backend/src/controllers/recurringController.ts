import { Context } from 'hono';
import prisma from '../client.ts';
import catchAsync from '../utils/catchAsync.ts';
import ApiError from '../utils/ApiError.ts';

export const getRecurring = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const recurring = await prisma.recurringTransaction.findMany({
    where: { userId, isDeleted: false }
  });
  return c.json(recurring);
});

export const createRecurring = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const { amount, type, category, frequency, nextDate, description } = body;

  const recurring = await prisma.recurringTransaction.create({
    data: {
      userId,
      amount: parseFloat(amount),
      type,
      category,
      frequency,
      nextDate: new Date(nextDate),
      description
    }
  });

  return c.json(recurring, 201);
});

export const updateRecurring = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { amount, type, category, frequency, nextDate, description } = body;

  const recurring = await prisma.recurringTransaction.findFirst({
    where: { id, userId, isDeleted: false }
  });

  if (!recurring) {
    throw new ApiError(404, 'Recurring transaction not found');
  }

  const updatedRecurring = await prisma.recurringTransaction.update({
    where: { id },
    data: {
      amount: amount !== undefined ? parseFloat(amount) : undefined,
      type,
      category,
      frequency,
      nextDate: nextDate ? new Date(nextDate) : undefined,
      description
    }
  });

  return c.json(updatedRecurring);
});

export const deleteRecurring = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const id = parseInt(c.req.param('id'));

  const recurring = await prisma.recurringTransaction.findFirst({
    where: { id, userId, isDeleted: false }
  });

  if (!recurring) {
    throw new ApiError(404, 'Recurring transaction not found');
  }

  await prisma.recurringTransaction.update({
    where: { id },
    data: { isDeleted: true }
  });

  return c.json({ message: 'Recurring transaction deleted successfully' });
});
