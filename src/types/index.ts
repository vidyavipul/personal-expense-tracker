// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Request body types
export interface CreateUserBody {
  name: string;
  email: string;
  monthlyBudget: number;
}

export interface CreateExpenseBody {
  title: string;
  amount: number;
  category: string;
  date?: string;
  userId: string;
}

// Query params
export interface ExpenseQueryParams {
  page?: string;
  limit?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}
