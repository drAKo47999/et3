import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { CategoryIcon } from '../utils/categoryIcons';
import { Expense } from '../types';
import {
  TrendingUp,
  CreditCard,
  Calendar,
  Layers,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Sparkles,
  Smartphone,
  Trash2,
  Edit2,
  PieChart,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenAddModal: () => void;
  onOpenCalendar: () => void;
  onOpenWidgetTab: () => void;
  onOpenCategoryTab: () => void;
  onEditExpense: (expense: Expense) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddModal,
  onOpenCalendar,
  onOpenWidgetTab,
  onOpenCategoryTab,
  onEditExpense,
}) => {
  const {
    expenses,
    dailyTotal,
    weeklyTotal,
    monthlyTotal,
    currency,
    filteredCategorySpends,
    deleteExpense,
  } = useExpense();
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');

  // Filter recent expenses
  const recentExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const matchesSearch =
          exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory =
          selectedCatFilter === 'all' || exp.categoryId === selectedCatFilter;
        return matchesSearch && matchesCategory;
      })
      .slice(0, 15);
  }, [expenses, searchQuery, selectedCatFilter]);

  // Current month name
  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  // Top category this month
  const topCategory = filteredCategorySpends[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Hero Material You Card */}
      <div
        className="relative overflow-hidden rounded-[32px] p-6 sm:p-8 transition-all shadow-md border"
        style={{
          backgroundColor: colors.surfaceContainer,
          borderColor: `${colors.outline}20`,
        }}
      >
        {/* Ambient tonal blur background lights */}
        <div
          className="absolute -top-16 -right-16 w-60 h-60 rounded-full blur-3xl opacity-35 pointer-events-none"
          style={{ backgroundColor: colors.primary }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: colors.secondary }}
        />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 shadow-sm"
              style={{
                backgroundColor: colors.primaryContainer,
                color: colors.onPrimaryContainer,
              }}
            >
              <Sparkles size={12} />
              <span>{currentMonthName}</span>
            </span>

            <button
              onClick={onOpenWidgetTab}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border hover:opacity-90 transition-all"
              style={{
                borderColor: `${colors.outline}30`,
                color: colors.primary,
                backgroundColor: colors.surface,
              }}
            >
              <Smartphone size={13} />
              <span>Launcher Widget</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="mt-4">
            <div className="text-xs font-medium opacity-65">Total Monthly Expense</div>
            <div
              className="text-4xl sm:text-5xl font-black tracking-tight mt-1"
              style={{ color: colors.onSurface }}
            >
              {currency}
              {monthlyTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t"
            style={{ borderColor: `${colors.outline}20` }}
          >
            {/* Today */}
            <div
              className="p-3.5 rounded-2xl transition-all"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="text-[11px] opacity-60">Today</div>
              <div className="text-lg font-bold tracking-tight mt-0.5" style={{ color: colors.onSurface }}>
                {currency}
                {dailyTotal.toFixed(2)}
              </div>
              <div className="text-[10px] opacity-50 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                <span>Daily Tracker</span>
              </div>
            </div>

            {/* This Week */}
            <div
              className="p-3.5 rounded-2xl transition-all"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="text-[11px] opacity-60">This Week</div>
              <div className="text-lg font-bold tracking-tight mt-0.5" style={{ color: colors.onSurface }}>
                {currency}
                {weeklyTotal.toFixed(2)}
              </div>
              <div className="text-[10px] opacity-50 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.secondary }} />
                <span>7-Day Cycle</span>
              </div>
            </div>

            {/* Top Category */}
            <div
              className="p-3.5 rounded-2xl transition-all"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="text-[11px] opacity-60">Top Category</div>
              <div className="text-lg font-bold tracking-tight mt-0.5 truncate" style={{ color: colors.onSurface }}>
                {topCategory ? topCategory.category.name : '—'}
              </div>
              <div className="text-[10px] opacity-50 mt-1 truncate">
                {topCategory ? `${topCategory.percentage.toFixed(0)}% of total` : 'No expenses'}
              </div>
            </div>

            {/* Calendar Shortcut */}
            <button
              onClick={onOpenCalendar}
              className="p-3.5 rounded-2xl transition-all text-left group hover:scale-[1.02] border"
              style={{
                backgroundColor: colors.primaryContainer,
                borderColor: `${colors.primary}30`,
                color: colors.onPrimaryContainer,
              }}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span>Custom Dates</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-xs font-semibold mt-1">Calendar View</div>
              <div className="text-[10px] opacity-75 mt-1">Select exact days &gt;</div>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Breakdown Teaser */}
      {filteredCategorySpends.length > 0 && (
        <div
          className="rounded-[28px] p-5 border shadow-sm transition-all"
          style={{
            backgroundColor: colors.surfaceContainer,
            borderColor: `${colors.outline}20`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider opacity-65 flex items-center gap-1.5">
              <PieChart size={14} style={{ color: colors.primary }} />
              <span>Category Spending</span>
            </span>
            <button
              onClick={onOpenCategoryTab}
              className="text-xs font-semibold flex items-center gap-1 hover:underline"
              style={{ color: colors.primary }}
            >
              <span>View All & Budgets</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Visual multi-segmented distribution */}
          <div className="w-full h-3 rounded-full flex overflow-hidden mb-3.5 bg-black/5 dark:bg-white/5">
            {filteredCategorySpends.slice(0, 6).map((item) => (
              <div
                key={item.category.id}
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.category.color,
                }}
                title={`${item.category.name}: ${item.percentage.toFixed(1)}%`}
              />
            ))}
          </div>

          {/* Horizontal scrollable category tiles */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {filteredCategorySpends.slice(0, 7).map(({ category, total, percentage }) => (
              <button
                key={category.id}
                onClick={onOpenCategoryTab}
                className="p-3 rounded-2xl flex-shrink-0 min-w-[130px] text-left border transition-all hover:scale-105"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: `${colors.outline}15`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${category.color}25`,
                      color: category.color,
                    }}
                  >
                    <CategoryIcon name={category.icon} size={15} />
                  </div>
                  <span className="text-xs font-bold truncate" style={{ color: colors.onSurface }}>
                    {category.name}
                  </span>
                </div>
                <div className="text-sm font-extrabold" style={{ color: colors.onSurface }}>
                  {currency}
                  {total.toFixed(0)}
                </div>
                <div className="text-[10px] opacity-60 mt-0.5">{percentage.toFixed(0)}% of total</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Section */}
      <div
        className="rounded-[28px] p-6 border shadow-sm transition-all"
        style={{
          backgroundColor: colors.surfaceContainer,
          borderColor: `${colors.outline}20`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold tracking-tight" style={{ color: colors.onSurface }}>
              Recent Transactions
            </h3>
            <p className="text-xs opacity-60">Track, edit, or categorize your latest expenses</p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-transform active:scale-95"
            style={{
              backgroundColor: colors.primary,
              color: colors.onPrimary,
            }}
          >
            <Plus size={15} />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
          <div
            className="w-full sm:flex-1 flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs"
            style={{
              backgroundColor: colors.surface,
              borderColor: `${colors.outline}30`,
              color: colors.onSurface,
            }}
          >
            <Search size={15} className="opacity-50" />
            <input
              type="text"
              placeholder="Search expenses by title or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>

          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl border text-xs outline-none cursor-pointer"
            style={{
              backgroundColor: colors.surface,
              borderColor: `${colors.outline}30`,
              color: colors.onSurface,
            }}
          >
            <option value="all">All Categories</option>
            {filteredCategorySpends.map(({ category }) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* List of Recent Expenses */}
        <div className="space-y-2">
          {recentExpenses.length === 0 ? (
            <div
              className="p-8 rounded-2xl text-center border border-dashed flex flex-col items-center justify-center gap-2"
              style={{
                backgroundColor: colors.surface,
                borderColor: `${colors.outline}40`,
              }}
            >
              <div className="text-sm font-semibold opacity-75">No transactions found</div>
              <p className="text-xs opacity-50">
                {searchQuery ? 'Try clearing your search query.' : 'Start adding your daily expenses!'}
              </p>
            </div>
          ) : (
            recentExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-3.5 rounded-2xl flex items-center justify-between border transition-all hover:translate-x-0.5"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: `${colors.outline}20`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${colors.primaryContainer}70`,
                      color: colors.primary,
                    }}
                  >
                    <CategoryIcon name="DollarSign" size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: colors.onSurface }}>
                      {exp.title}
                    </div>
                    <div className="text-xs opacity-60 flex items-center gap-2 mt-0.5 flex-wrap">
                      <span>{exp.date}</span>
                      {exp.time && <span>• {exp.time}</span>}
                      {exp.paymentMethod && (
                        <span className="capitalize">• {exp.paymentMethod.replace('_', ' ')}</span>
                      )}
                      {exp.notes && <span>• "{exp.notes}"</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-extrabold" style={{ color: colors.onSurface }}>
                      -{currency}
                      {exp.amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-70 hover:opacity-100">
                    <button
                      onClick={() => onEditExpense(exp)}
                      className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
