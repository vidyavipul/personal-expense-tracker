import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Expense from '../models/Expense';
import User from '../models/User';

export const getUserSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid user ID' });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Get current month range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Aggregate total expenses for current month
    const expenseAgg = await Expense.aggregate([
      { $match: { userId: user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, totalExpenses: { $sum: '$amount' }, count: { $count: {} } } },
    ]);

    // Aggregate by category
    const categoryAgg = await Expense.aggregate([
      { $match: { userId: user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $count: {} } } },
      { $sort: { total: -1 } },
    ]);

    const totalExpenses = expenseAgg[0]?.totalExpenses || 0;
    const numberOfExpenses = expenseAgg[0]?.count || 0;
    const remainingBudget = Math.round((user.monthlyBudget - totalExpenses) * 100) / 100;

    res.json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, monthlyBudget: user.monthlyBudget },
        currentMonth: { month: startOfMonth.toLocaleString('default', { month: 'long' }), year: now.getFullYear() },
        summary: {
          totalExpenses: Math.round(totalExpenses * 100) / 100,
          remainingBudget,
          numberOfExpenses,
          budgetUtilization: user.monthlyBudget > 0 ? `${((totalExpenses / user.monthlyBudget) * 100).toFixed(2)}%` : '0%',
        },
        expensesByCategory: categoryAgg.map((c) => ({ category: c._id, total: Math.round(c.total * 100) / 100, count: c.count })),
      },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
