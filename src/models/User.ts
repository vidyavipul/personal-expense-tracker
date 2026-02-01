import mongoose, { Document, Schema, Model } from 'mongoose';
import { formatDateIST } from '../utils/helpers';

export interface IUser extends Document {
  name: string;
  email: string;
  monthlyBudget: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    },
    monthlyBudget: {
      type: Number,
      required: [true, 'Monthly budget is required'],
      min: [1, 'Monthly budget must be greater than 0'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const transformed: any = { ...ret };
        if (transformed.createdAt) transformed.createdAt = formatDateIST(transformed.createdAt);
        if (transformed.updatedAt) transformed.updatedAt = formatDateIST(transformed.updatedAt);
        return transformed;
      },
    },
  }
);

// Pre-save: normalize and round budget
userSchema.pre('save', function () {
  if (this.isModified('name')) this.name = this.name.trim();
  if (this.isModified('email')) this.email = this.email.toLowerCase().trim();
  if (this.isModified('monthlyBudget')) {
    this.monthlyBudget = Math.round(this.monthlyBudget * 100) / 100;
  }
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
