import mongoose from 'mongoose';

// Validate MongoDB ObjectId
export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Parse pagination from query params
export const parsePagination = (page?: string, limit?: string) => {
  const defaultPageSize = parseInt(process.env.DEFAULT_PAGE_SIZE || '10', 10);
  const maxPageSize = parseInt(process.env.MAX_PAGE_SIZE || '100', 10);
  
  const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
  const limitNum = Math.min(maxPageSize, Math.max(1, parseInt(limit || String(defaultPageSize), 10) || defaultPageSize));
  return { page: pageNum, limit: limitNum, skip: (pageNum - 1) * limitNum };
};

// Get current month date range
export const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { startOfMonth: start, endOfMonth: end };
};

// Convert UTC date to IST (Indian Standard Time - UTC+5:30)
export const toIST = (date: Date = new Date()): string => {
  const utcTime = date.getTime();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(utcTime + istOffset);
  return istTime.toISOString().replace('Z', '+05:30');
};

// Format date to readable IST format: DD-MM-YYYY HH:MM:SS IST
export const formatDateIST = (date: Date): string => {
  const utcTime = date.getTime();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(utcTime + istOffset);
  
  const day = String(istTime.getUTCDate()).padStart(2, '0');
  const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
  const year = istTime.getUTCFullYear();
  const hours = String(istTime.getUTCHours()).padStart(2, '0');
  const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(istTime.getUTCSeconds()).padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds} IST`;
};
