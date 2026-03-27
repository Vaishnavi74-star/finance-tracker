import { Context } from 'hono';
import prisma from '../client.ts';
import catchAsync from '../utils/catchAsync.ts';
import ApiError from '../utils/ApiError.ts';

export const getGoals = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const goals = await prisma.savingsGoal.findMany({
    where: { userId, isDeleted: false }
  });
  return c.json(goals);
});

export const createGoal = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const { name, targetAmount, currentAmount, deadline, icon } = body;

  const goal = await prisma.savingsGoal.create({
    data: {
      userId,
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
      deadline: new Date(deadline),
      icon
    }
  });

  return c.json(goal, 201);
});

export const updateGoal = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { name, targetAmount, currentAmount, deadline, icon } = body;

  const goal = await prisma.savingsGoal.findFirst({
    where: { id, userId, isDeleted: false }
  });

  if (!goal) {
    throw new ApiError(404, 'Goal not found');
  }

  const updatedGoal = await prisma.savingsGoal.update({
    where: { id },
    data: {
      name,
      targetAmount: targetAmount !== undefined ? parseFloat(targetAmount) : undefined,
      currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      icon
    }
  });

  return c.json(updatedGoal);
});

export const deleteGoal = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const id = parseInt(c.req.param('id'));

  const goal = await prisma.savingsGoal.findFirst({
    where: { id, userId, isDeleted: false }
  });

  if (!goal) {
    throw new ApiError(404, 'Goal not found');
  }

  await prisma.savingsGoal.update({
    where: { id },
    data: { isDeleted: true }
  });

  return c.json({ message: 'Goal deleted successfully' });
});
