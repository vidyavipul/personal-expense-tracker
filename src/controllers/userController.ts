import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, monthlyBudget } = req.body;

    if (!name || !email || monthlyBudget === undefined) {
      res.status(400).json({ success: false, error: 'Name, email, and monthlyBudget are required' });
      return;
    }

    const user = new User({ name, email, monthlyBudget });
    const savedUser = await user.save();

    res.status(201).json({ success: true, data: savedUser });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      res.status(409).json({ success: false, error: 'Email already exists' });
      return;
    }
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
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

    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.query;
    
    // Build filter object
    const filter: any = {};
    if (email && typeof email === 'string') {
      filter.email = email.toLowerCase().trim();
    }
    
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: users, count: users.length });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
