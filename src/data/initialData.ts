import { Category, Expense } from '../types';

// The app starts as a blank slate: no placeholder categories or expenses.
export const DEFAULT_CATEGORIES: Category[] = [];

export function getInitialExpenses(): Expense[] {
  return [];
}
