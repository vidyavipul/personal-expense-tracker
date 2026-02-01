import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Expense, { EXPENSE_CATEGORIES } from '../models/Expense';
import User from '../models/User';

export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, amount, category, date, userId } = req.body;

    if (!title || amount === undefined || !category || !userId) {
      res.status(400).json({ success: false, error: 'Title, amount, category, and userId are required' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, error: 'Invalid user ID' });
      return;
    }

    const expense = new Expense({
      title,
      amount,
      category,
      date: date ? new Date(date) : new Date(),
      userId,
    });

    const savedExpense = await expense.save();
    await savedExpense.populate('userId', 'name email');

    res.status(201).json({ success: true, data: savedExpense });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getUserExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { category, startDate, endDate, page = '1', limit = '10' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid user ID' });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Build filter
    const filter: Record<string, unknown> = { userId: id };

    if (category && typeof category === 'string') {
      if (!EXPENSE_CATEGORIES.includes(category as typeof EXPENSE_CATEGORIES[number])) {
        res.status(400).json({ success: false, error: `Invalid category. Must be one of: ${EXPENSE_CATEGORIES.join(', ')}` });
        return;
      }
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) (filter.date as Record<string, Date>).$gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        (filter.date as Record<string, Date>).$lte = end;
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).skip(skip).limit(limitNum),
      Expense.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: expenses,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
