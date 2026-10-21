import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Category, Expense, DateRangeFilter, BackupData } from '../types';
import { DEFAULT_CATEGORIES, getInitialExpenses } from '../data/initialData';
import { useTheme } from './ThemeContext';

interface CategorySpend {
  category: Category;
  total: number;
  count: number;
  percentage: number;
  budget?: number;
  budgetProgress?: number;
}

interface ExpenseContextType {
  expenses: Expense[];
  categories: Category[];
  currency: string;
  setCurrency: (curr: string) => void;
  filter: DateRangeFilter;
  setFilter: (filter: DateRangeFilter) => void;
  // CRUD
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Expense;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
  deleteExpense: (id: string) => void;
  // Category management
  addCategory: (category: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  // Computed stats
  dailyTotal: number;
  weeklyTotal: number;
  monthlyTotal: number;
  filteredExpenses: Expense[];
  filteredTotal: number;
  filteredCategorySpends: CategorySpend[];
  // Calendar data
  dateSpendingMap: Record<string, number>;
  // Quick filters
  applyDatePreset: (preset: DateRangeFilter['type']) => void;
  selectSingleDate: (dateStr: string) => void;
  selectDateRange: (startStr: string, endStr: string) => void;
  // Import/Export
  exportData: () => BackupData;
  importData: (backup: BackupData, mode: 'replace' | 'merge') => void;
  resetToDefaults: () => void;
}

const EXPENSES_STORAGE_KEY = 'monet_expenses_list_v1';
const CATEGORIES_STORAGE_KEY = 'monet_categories_list_v1';
const SETTINGS_STORAGE_KEY = 'monet_settings_v1';

// One-time cleanup: remove the old built-in sample data from existing installs,
// while keeping anything the user added themselves.
const LEGACY_CATEGORY_IDS = [
  'cat-food', 'cat-groceries', 'cat-transport', 'cat-housing', 'cat-utilities',
  'cat-entertainment', 'cat-health', 'cat-shopping', 'cat-travel', 'cat-other',
];
(function removeSampleData() {
  try {
    if (localStorage.getItem('monet_blank_slate_v1')) return;
    const rawE = localStorage.getItem(EXPENSES_STORAGE_KEY);
    const rawC = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (rawE) {
      const kept = (JSON.parse(rawE) as Expense[]).filter((e) => !/^exp-\d{1,2}$/.test(e.id));
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(kept));
      if (rawC) {
        const used = new Set(kept.map((e) => e.categoryId));
        const cats = (JSON.parse(rawC) as Category[]).filter(
          (c) => !(LEGACY_CATEGORY_IDS.includes(c.id) && c.isDefault && !used.has(c.id))
        );
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(cats));
      }
    } else if (rawC) {
      const cats = (JSON.parse(rawC) as Category[]).filter(
        (c) => !(LEGACY_CATEGORY_IDS.includes(c.id) && c.isDefault)
      );
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(cats));
    }
    localStorage.setItem('monet_blank_slate_v1', '1');
  } catch (e) {
    console.error(e);
  }
})();

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Helper to format Date to YYYY-MM-DD
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { themeConfig } = useTheme();

  // Load Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CATEGORIES;
  });

  // Load Expenses
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(EXPENSES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getInitialExpenses();
  });

  // Load Currency
  const [currency, setCurrencyState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currency) return parsed.currency;
      }
    } catch (e) {
      console.error(e);
    }
    return '$';
  });

  // Default filter: This Month
  const [filter, setFilter] = useState<DateRangeFilter>(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      type: 'this_month',
      startDate: formatDate(firstDay),
      endDate: formatDate(lastDay),
      label: 'This Month',
    };
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.error(e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  const setCurrency = (curr: string) => {
    setCurrencyState(curr);
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}';
      const parsed = JSON.parse(saved);
      parsed.currency = curr;
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {
      console.error(e);
    }
  };

  // Add Expense
  const addExpense = (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Expense => {
    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    return newExpense;
  };

  // Update Expense
  const updateExpense = (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item))
    );
  };

  // Delete Expense
  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  // Category management
  const addCategory = (data: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...data,
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      isDefault: false,
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<Omit<Category, 'id'>>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  };

  const deleteCategory = (id: string) => {
    // Reassign any expenses belonging to this category to 'cat-other' or first available
    const fallbackId = categories.find((c) => c.id !== id)?.id || 'cat-other';
    setExpenses((prev) =>
      prev.map((e) => (e.categoryId === id ? { ...e, categoryId: fallbackId } : e))
    );
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  // Date range preset applicator
  const applyDatePreset = (preset: DateRangeFilter['type']) => {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);
    let label = 'Custom';

    switch (preset) {
      case 'today': {
        label = 'Today';
        break;
      }
      case 'yesterday': {
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
        label = 'Yesterday';
        break;
      }
      case 'this_week': {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
        start = new Date(now.setDate(diff));
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        label = 'This Week';
        break;
      }
      case 'last_7_days': {
        start.setDate(now.getDate() - 6);
        end = new Date(now);
        label = 'Last 7 Days';
        break;
      }
      case 'this_month': {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        label = 'This Month';
        break;
      }
      case 'last_month': {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        label = 'Last Month';
        break;
      }
      case 'all': {
        start = new Date(2020, 0, 1);
        end = new Date(2035, 11, 31);
        label = 'All Time';
        break;
      }
      default:
        break;
    }

    setFilter({
      type: preset,
      startDate: formatDate(start),
      endDate: formatDate(end),
      label,
    });
  };

  const selectSingleDate = (dateStr: string) => {
    setFilter({
      type: 'custom_single',
      startDate: dateStr,
      endDate: dateStr,
      label: new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    });
  };

  const selectDateRange = (startStr: string, endStr: string) => {
    const sDate = startStr <= endStr ? startStr : endStr;
    const eDate = startStr <= endStr ? endStr : startStr;
    const formatNice = (d: string) =>
      new Date(d + 'T00:00:00').toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    setFilter({
      type: 'custom_range',
      startDate: sDate,
      endDate: eDate,
      label: `${formatNice(sDate)} – ${formatNice(eDate)}`,
    });
  };

  // Calendar spending map (maps YYYY-MM-DD -> total expense amount)
  const dateSpendingMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const exp of expenses) {
      if (!map[exp.date]) {
        map[exp.date] = 0;
      }
      map[exp.date] += exp.amount;
    }
    return map;
  }, [expenses]);

  // Today's total
  const dailyTotal = useMemo(() => {
    const todayStr = formatDate(new Date());
    return expenses
      .filter((e) => e.date === todayStr)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Weekly total (current week Mon-Sun)
  const weeklyTotal = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const startStr = formatDate(monday);
    const endStr = formatDate(sunday);

    return expenses
      .filter((e) => e.date >= startStr && e.date <= endStr)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Monthly total (current calendar month)
  const monthlyTotal = useMemo(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startStr = formatDate(firstDay);
    const endStr = formatDate(lastDay);

    return expenses
      .filter((e) => e.date >= startStr && e.date <= endStr)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Filtered expenses based on active DateRangeFilter
  const filteredExpenses = useMemo(() => {
    return expenses.filter(
      (e) => e.date >= filter.startDate && e.date <= filter.endDate
    );
  }, [expenses, filter]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  // Category breakdown for current filter
  const filteredCategorySpends = useMemo((): CategorySpend[] => {
    const categoryTotals: Record<string, { total: number; count: number }> = {};

    for (const exp of filteredExpenses) {
      if (!categoryTotals[exp.categoryId]) {
        categoryTotals[exp.categoryId] = { total: 0, count: 0 };
      }
      categoryTotals[exp.categoryId].total += exp.amount;
      categoryTotals[exp.categoryId].count += 1;
    }

    const results: CategorySpend[] = categories
      .map((cat) => {
        const item = categoryTotals[cat.id] || { total: 0, count: 0 };
        const percentage = filteredTotal > 0 ? (item.total / filteredTotal) * 100 : 0;
        const budgetProgress =
          cat.budget && cat.budget > 0 ? (item.total / cat.budget) * 100 : undefined;

        return {
          category: cat,
          total: item.total,
          count: item.count,
          percentage,
          budget: cat.budget,
          budgetProgress,
        };
      })
      .filter((c) => c.total > 0 || c.category.budget) // show active or budgeted
      .sort((a, b) => b.total - a.total);

    return results;
  }, [filteredExpenses, categories, filteredTotal]);

  // Export data
  const exportData = (): BackupData => {
    return {
      version: 1,
      appName: 'Monet Expense Tracker',
      timestamp: new Date().toISOString(),
      expenses,
      categories,
      settings: {
        currency,
        themeConfig,
      },
    };
  };

  // Import data
  const importData = (backup: BackupData, mode: 'replace' | 'merge') => {
    if (!backup || !Array.isArray(backup.expenses)) {
      throw new Error('Invalid backup file');
    }

    if (mode === 'replace') {
      setExpenses(backup.expenses);
      if (Array.isArray(backup.categories) && backup.categories.length > 0) {
        setCategories(backup.categories);
      }
      if (backup.settings?.currency) {
        setCurrency(backup.settings.currency);
      }
    } else {
      // Merge mode
      const existingIds = new Set(expenses.map((e) => e.id));
      const newExpenses = backup.expenses.filter((e) => !existingIds.has(e.id));
      setExpenses((prev) => [...newExpenses, ...prev]);

      const existingCatIds = new Set(categories.map((c) => c.id));
      const newCategories = (backup.categories || []).filter((c) => !existingCatIds.has(c.id));
      if (newCategories.length > 0) {
        setCategories((prev) => [...prev, ...newCategories]);
      }
    }
  };

  const resetToDefaults = () => {
    setExpenses(getInitialExpenses());
    setCategories(DEFAULT_CATEGORIES);
    setCurrency('$');
    applyDatePreset('this_month');
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        categories,
        currency,
        setCurrency,
        filter,
        setFilter,
        addExpense,
        updateExpense,
        deleteExpense,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
        dailyTotal,
        weeklyTotal,
        monthlyTotal,
        filteredExpenses,
        filteredTotal,
        filteredCategorySpends,
        dateSpendingMap,
        applyDatePreset,
        selectSingleDate,
        selectDateRange,
        exportData,
        importData,
        resetToDefaults,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
