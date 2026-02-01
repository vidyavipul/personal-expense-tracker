import mongoose from 'mongoose';

// Validate MongoDB ObjectId
export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Parse pagination from query params
export const parsePagination = (page?: string, limit?: string) => {
  const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit || '10', 10) || 10));
  return { page: pageNum, limit: limitNum, skip: (pageNum - 1) * limitNum };
};

// Get current month date range
export const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { startOfMonth: start, endOfMonth: end };
};
