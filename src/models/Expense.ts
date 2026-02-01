import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import User from './User';
import { formatDateIST } from '../utils/helpers';

export const EXPENSE_CATEGORIES = [
  'Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Other'
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface IExpense extends Document {
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: EXPENSE_CATEGORIES, message: 'Invalid category' },
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const transformed: any = { ...ret };
        if (transformed.createdAt) transformed.createdAt = formatDateIST(transformed.createdAt);
        if (transformed.updatedAt) transformed.updatedAt = formatDateIST(transformed.updatedAt);
        if (transformed.date) transformed.date = formatDateIST(transformed.date);
        return transformed;
      },
    },
  }
);

// Pre-validate: check if user exists
expenseSchema.pre('validate', async function () {
  if (this.isModified('userId') || this.isNew) {
    const userExists = await User.findById(this.userId);
    if (!userExists) {
      this.invalidate('userId', 'User does not exist');
    }
  }
});

// Pre-save: normalize data
expenseSchema.pre('save', function () {
  if (this.isModified('title')) this.title = this.title.trim();
  if (this.isModified('amount')) {
    this.amount = Math.round(this.amount * 100) / 100;
  }
});

// Indexes for efficient queries
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

const Expense: Model<IExpense> = mongoose.model<IExpense>('Expense', expenseSchema);

export default Expense;
