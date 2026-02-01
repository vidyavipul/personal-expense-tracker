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

// PUT - Full update (name and monthlyBudget only, email excluded)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, monthlyBudget } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid user ID' });
      return;
    }

    // For PUT, both fields are required
    if (!name || monthlyBudget === undefined) {
      res.status(400).json({ success: false, error: 'Name and monthlyBudget are required' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { name, monthlyBudget },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({ success: true, message: 'User updated successfully', data: user });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// PATCH - Partial update (name and/or monthlyBudget, email excluded)
export const partialUpdateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid user ID' });
      return;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ success: false, error: 'No fields to update' });
      return;
    }

    // Only allow name and monthlyBudget updates (email excluded for security)
    const allowedFields = ['name', 'monthlyBudget'];
    const filteredUpdates: Record<string, unknown> = {};
    
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      res.status(400).json({ success: false, error: 'No valid fields to update. Only name and monthlyBudget can be updated.' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({ success: true, message: 'User partially updated successfully', data: user });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// POST - Change email (requires current email verification)
export const changeUserEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { currentEmail, newEmail } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid user ID' });
      return;
    }

    if (!currentEmail || !newEmail) {
      res.status(400).json({ success: false, error: 'Current email and new email are required' });
      return;
    }

    // Find user and verify current email
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Verify current email matches
    if (user.email.toLowerCase() !== currentEmail.toLowerCase().trim()) {
      res.status(403).json({ success: false, error: 'Current email does not match' });
      return;
    }

    // Check if new email already exists
    const emailExists = await User.findOne({ email: newEmail.toLowerCase().trim(), _id: { $ne: id } });
    if (emailExists) {
      res.status(409).json({ success: false, error: 'New email already exists' });
      return;
    }

    // Update email
    user.email = newEmail.toLowerCase().trim();
    await user.save();

    res.json({ success: true, message: 'Email updated successfully', data: user });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
