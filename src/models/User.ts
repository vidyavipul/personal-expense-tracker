import mongoose, { Document, Schema, Model } from 'mongoose';

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
  { timestamps: true }
);

// Pre-save: normalize and round budget
userSchema.pre('save', function () {
  if (this.isModified('name')) this.name = this.name.trim();
  if (this.isModified('email')) this.email = this.email.toLowerCase().trim();
  if (this.isModified('monthlyBudget')) {
    this.monthlyBudget = Math.round(this.monthlyBudget * 100) / 100;
  }
});

// Index for email uniqueness
userSchema.index({ email: 1 }, { unique: true });

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
