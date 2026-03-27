import { Context } from 'hono';
import prisma from '../client.ts';
import catchAsync from '../utils/catchAsync.ts';
import ApiError from '../utils/ApiError.ts';

const DEFAULT_CATEGORIES = [
  { name: 'Food', icon: 'Utensils', color: '#EF4444' },
  { name: 'Rent', icon: 'Home', color: '#3B82F6' },
  { name: 'Salary', icon: 'IndianRupee', color: '#10B981' },
  { name: 'Entertainment', icon: 'Film', color: '#8B5CF6' },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#F59E0B' },
  { name: 'Transport', icon: 'Car', color: '#6B7280' },
  { name: 'Bills', icon: 'FileText', color: '#EC4899' },
  { name: 'Healthcare', icon: 'Heart', color: '#14B8A6' },
];

export const getCategories = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  let categories = await prisma.category.findMany({
    where: { userId, isDeleted: false }
  });

  if (categories.length === 0) {
    // Seed default categories for new user
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map(cat => ({ ...cat, userId }))
    });
    categories = await prisma.category.findMany({
      where: { userId, isDeleted: false }
    });
  }

  return c.json(categories);
});

export const createCategory = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const { name, icon, color } = body;

  const category = await prisma.category.create({
    data: {
      userId,
      name,
      icon,
      color
    }
  });

  return c.json(category, 201);
});

export const updateCategory = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { name, icon, color } = body;

  const category = await prisma.category.findFirst({
    where: { id, userId, isDeleted: false }
  });

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      name,
      icon,
      color
    }
  });

  return c.json(updatedCategory);
});

export const deleteCategory = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const id = parseInt(c.req.param('id'));

  const category = await prisma.category.findFirst({
    where: { id, userId, isDeleted: false }
  });

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  await prisma.category.update({
    where: { id },
    data: { isDeleted: true }
  });

  return c.json({ message: 'Category deleted successfully' });
});
