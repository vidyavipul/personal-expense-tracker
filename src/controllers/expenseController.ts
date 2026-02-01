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

// PUT - Full expense update
export const updateExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, amount, category, date, userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid expense ID' });
      return;
    }

    // For PUT, all fields are required
    if (!title || amount === undefined || !category || !userId) {
      res.status(400).json({ success: false, error: 'Title, amount, category, and userId are required' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, error: 'Invalid user ID' });
      return;
    }

    const expense = await Expense.findByIdAndUpdate(
      id,
      {
        title,
        amount,
        category,
        date: date ? new Date(date) : new Date(),
        userId,
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!expense) {
      res.status(404).json({ success: false, error: 'Expense not found' });
      return;
    }

    res.json({ success: true, message: 'Expense updated successfully', data: expense });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// PATCH - Partial expense update
export const partialUpdateExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid expense ID' });
      return;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ success: false, error: 'No fields to update' });
      return;
    }

    // Only allow specific fields to be updated
    const allowedFields = ['title', 'amount', 'category', 'date', 'userId'];
    const filteredUpdates: Record<string, unknown> = {};
    
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        if (key === 'date' && updates[key]) {
          filteredUpdates[key] = new Date(updates[key]);
        } else if (key === 'userId' && updates[key]) {
          if (!mongoose.Types.ObjectId.isValid(updates[key])) {
            res.status(400).json({ success: false, error: 'Invalid user ID' });
            return;
          }
          filteredUpdates[key] = updates[key];
        } else {
          filteredUpdates[key] = updates[key];
        }
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      res.status(400).json({ success: false, error: 'No valid fields to update' });
      return;
    }

    const expense = await Expense.findByIdAndUpdate(
      id,
      filteredUpdates,
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!expense) {
      res.status(404).json({ success: false, error: 'Expense not found' });
      return;
    }

    res.json({ success: true, message: 'Expense partially updated successfully', data: expense });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
