import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { CategoryIcon } from '../utils/categoryIcons';
import { formatDate } from '../context/ExpenseContext';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  DollarSign,
  Clock,
  ArrowRight,
  PlusCircle,
  Tag,
  CreditCard,
  Trash2,
  Edit2,
} from 'lucide-react';
import { Expense } from '../types';

interface CalendarViewProps {
  onAddExpenseForDate?: (dateStr: string) => void;
  onEditExpense?: (expense: Expense) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onAddExpenseForDate,
  onEditExpense,
}) => {
  const {
    filter,
    setFilter,
    applyDatePreset,
    selectSingleDate,
    selectDateRange,
    dateSpendingMap,
    filteredExpenses,
    filteredTotal,
    filteredCategorySpends,
    currency,
    deleteExpense,
  } = useExpense();

  const { colors } = useTheme();

  // Current calendar view month & year state (defaults to filter start date or current date)
  const initialDate = useMemo(() => {
    if (filter.startDate) {
      return new Date(filter.startDate + 'T00:00:00');
    }
    return new Date();
  }, [filter.startDate]);

  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-indexed

  // Selection mode: 'single' or 'range'
  const [selectionMode, setSelectionMode] = useState<'single' | 'range'>(
    filter.type === 'custom_range' ? 'range' : 'single'
  );
  const [rangeStart, setRangeStart] = useState<string | null>(null);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    applyDatePreset('today');
  };

  // Calendar matrix calculations
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] =
      [];

    // Previous month padding days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum);
      const dateStr = formatDate(prevDate);
      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isToday: dateStr === formatDate(new Date()),
      });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const curDate = new Date(currentYear, currentMonth, i);
      const dateStr = formatDate(curDate);
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: true,
        isToday: dateStr === formatDate(new Date()),
      });
    }

    // Trailing next month padding days to complete full 7-day rows (up to 35 or 42 cells)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(currentYear, currentMonth + 1, i);
      const dateStr = formatDate(nextDate);
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
        isToday: dateStr === formatDate(new Date()),
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Handle clicking a date cell
  const handleDateClick = (dateStr: string) => {
    if (selectionMode === 'single') {
      selectSingleDate(dateStr);
      setRangeStart(null);
    } else {
      // Range mode
      if (!rangeStart) {
        setRangeStart(dateStr);
        // Temporarily select single
        selectSingleDate(dateStr);
      } else {
        selectDateRange(rangeStart, dateStr);
        setRangeStart(null);
      }
    }
  };

  // Check if a dateStr is in active selected range
  const isDateSelected = (dateStr: string) => {
    if (!filter.startDate || !filter.endDate) return false;
    return dateStr >= filter.startDate && dateStr <= filter.endDate;
  };

  const isRangeStart = (dateStr: string) => dateStr === filter.startDate;
  const isRangeEnd = (dateStr: string) => dateStr === filter.endDate;

  // Month name
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('default', {
    month: 'long',
  });

  // Calculate day count in filter
  const dayCount = useMemo(() => {
    if (!filter.startDate || !filter.endDate) return 1;
    const start = new Date(filter.startDate + 'T00:00:00');
    const end = new Date(filter.endDate + 'T00:00:00');
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [filter.startDate, filter.endDate]);

  const dailyAverage = dayCount > 0 ? filteredTotal / dayCount : filteredTotal;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header & Preset Quick Filters */}
      <div
        className="rounded-[28px] p-5 border transition-all"
        style={{
          backgroundColor: colors.surfaceContainer,
          borderColor: `${colors.outline}20`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div
              className="p-2.5 rounded-2xl"
              style={{
                backgroundColor: colors.primaryContainer,
                color: colors.onPrimaryContainer,
              }}
            >
              <CalendarIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight" style={{ color: colors.onSurface }}>
                Calendar & Custom Periods
              </h2>
              <p className="text-xs opacity-65">
                Select any single date or range of dates to see detailed summaries
              </p>
            </div>
          </div>

          {/* Single vs Range Mode Switcher */}
          <div
            className="flex items-center p-1 rounded-full border text-xs font-medium"
            style={{
              backgroundColor: colors.surface,
              borderColor: `${colors.outline}30`,
            }}
          >
            <button
              onClick={() => {
                setSelectionMode('single');
                setRangeStart(null);
                if (filter.startDate) selectSingleDate(filter.startDate);
              }}
              className="px-3 py-1.5 rounded-full transition-all"
              style={{
                backgroundColor: selectionMode === 'single' ? colors.primary : 'transparent',
                color: selectionMode === 'single' ? colors.onPrimary : colors.onSurface,
                fontWeight: selectionMode === 'single' ? 600 : 400,
              }}
            >
              Single Date
            </button>
            <button
              onClick={() => {
                setSelectionMode('range');
                setRangeStart(null);
              }}
              className="px-3 py-1.5 rounded-full transition-all"
              style={{
                backgroundColor: selectionMode === 'range' ? colors.primary : 'transparent',
                color: selectionMode === 'range' ? colors.onPrimary : colors.onSurface,
                fontWeight: selectionMode === 'range' ? 600 : 400,
              }}
            >
              Date Range
            </button>
          </div>
        </div>

        {/* Quick Presets Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'this_week', label: 'This Week' },
            { id: 'last_7_days', label: 'Last 7 Days' },
            { id: 'this_month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' },
            { id: 'all', label: 'All Time' },
          ].map((preset) => {
            const isActive = filter.type === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => applyDatePreset(preset.id as any)}
                className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border flex-shrink-0"
                style={{
                  backgroundColor: isActive ? colors.primaryContainer : colors.surface,
                  borderColor: isActive ? colors.primary : `${colors.outline}20`,
                  color: isActive ? colors.onPrimaryContainer : colors.onSurface,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Calendar Grid Card */}
      <div
        className="rounded-[28px] p-6 border shadow-sm transition-all"
        style={{
          backgroundColor: colors.surfaceContainer,
          borderColor: `${colors.outline}20`,
        }}
      >
        {/* Month Navigation Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold" style={{ color: colors.onSurface }}>
              {monthName} {currentYear}
            </span>
            <button
              onClick={goToToday}
              className="ml-2 text-xs px-2.5 py-1 rounded-full border transition-colors opacity-80 hover:opacity-100"
              style={{
                borderColor: `${colors.outline}40`,
                color: colors.primary,
              }}
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Previous month"
              style={{ color: colors.onSurface }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Next month"
              style={{ color: colors.onSurface }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Days of the week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold mb-2 opacity-60">
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarDays.map((cell, idx) => {
            const hasSpending = Boolean(dateSpendingMap[cell.dateStr]);
            const spendAmount = dateSpendingMap[cell.dateStr] || 0;
            const isSelected = isDateSelected(cell.dateStr);
            const isStart = isRangeStart(cell.dateStr);
            const isEnd = isRangeEnd(cell.dateStr);

            return (
              <button
                key={`${cell.dateStr}-${idx}`}
                onClick={() => handleDateClick(cell.dateStr)}
                className={`relative min-h-[64px] sm:min-h-[72px] p-1.5 sm:p-2 rounded-[18px] flex flex-col justify-between items-center transition-all group ${
                  cell.isCurrentMonth ? 'opacity-100' : 'opacity-35'
                }`}
                style={{
                  backgroundColor: isSelected
                    ? isStart || isEnd
                      ? colors.primary
                      : `${colors.primaryContainer}88`
                    : colors.surface,
                  color: isSelected
                    ? isStart || isEnd
                      ? colors.onPrimary
                      : colors.onPrimaryContainer
                    : colors.onSurface,
                  boxShadow: isSelected && (isStart || isEnd) ? `0 4px 12px ${colors.primary}40` : 'none',
                }}
              >
                {/* Date Number & Today marker */}
                <div className="w-full flex items-center justify-between text-xs font-semibold">
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full ${
                      cell.isToday && !isSelected
                        ? 'border-2'
                        : ''
                    }`}
                    style={{
                      borderColor: cell.isToday ? colors.primary : 'transparent',
                    }}
                  >
                    {cell.dayNum}
                  </span>

                  {cell.isToday && (
                    <span
                      className="text-[8px] font-bold px-1 rounded-sm uppercase tracking-wider"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${colors.primary}20`,
                        color: isSelected ? 'inherit' : colors.primary,
                      }}
                    >
                      Now
                    </span>
                  )}
                </div>

                {/* Spend dot / mini badge */}
                {hasSpending ? (
                  <div className="w-full text-center">
                    <span
                      className="inline-block text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-full truncate max-w-full"
                      style={{
                        backgroundColor: isSelected
                          ? 'rgba(255, 255, 255, 0.25)'
                          : `${colors.secondaryContainer}`,
                        color: isSelected ? '#ffffff' : colors.onSecondaryContainer,
                      }}
                    >
                      {currency}
                      {spendAmount >= 1000
                        ? `${(spendAmount / 1000).toFixed(1)}k`
                        : spendAmount.toFixed(0)}
                    </span>
                  </div>
                ) : (
                  <div className="h-4" />
                )}
              </button>
            );
          })}
        </div>

        {/* Calendar Legend & Selection Guide */}
        <div className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs opacity-70"
          style={{ borderColor: `${colors.outline}20` }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.primary }} />
              <span>Selected Period</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.secondary }} />
              <span>Has Expense</span>
            </span>
          </div>
          <div>
            {selectionMode === 'range'
              ? rangeStart
                ? `Click end date to finish range... (from ${rangeStart})`
                : 'Click start date, then end date'
              : 'Click any date to see that day\'s summary'}
          </div>
        </div>
      </div>

      {/* Selected Period Summary Card */}
      <div
        className="rounded-[28px] p-6 border shadow-sm transition-all"
        style={{
          backgroundColor: colors.surfaceContainer,
          borderColor: `${colors.outline}20`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase opacity-65 flex items-center gap-1.5">
              <span>SUMMARY FOR</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  backgroundColor: colors.primaryContainer,
                  color: colors.onPrimaryContainer,
                }}
              >
                {filter.label}
              </span>
            </div>
            <div className="text-3xl font-extrabold tracking-tight mt-1" style={{ color: colors.onSurface }}>
              {currency}
              {filteredTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-2xl text-center min-w-[100px]"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="text-[11px] opacity-60">Avg / Day</div>
              <div className="text-base font-bold" style={{ color: colors.onSurface }}>
                {currency}
                {dailyAverage.toFixed(1)}
              </div>
            </div>
            <div
              className="p-3 rounded-2xl text-center min-w-[90px]"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="text-[11px] opacity-60">Entries</div>
              <div className="text-base font-bold" style={{ color: colors.onSurface }}>
                {filteredExpenses.length}
              </div>
            </div>
            {onAddExpenseForDate && (
              <button
                onClick={() => onAddExpenseForDate(filter.startDate || formatDate(new Date()))}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-semibold shadow-sm hover:opacity-90 transition-transform active:scale-95"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.onPrimary,
                }}
              >
                <PlusCircle size={16} />
                <span>Add in this period</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Breakdown for this Period */}
        {filteredCategorySpends.length > 0 && (
          <div className="mb-6">
            <div className="text-xs font-bold uppercase tracking-wider opacity-65 mb-3">
              Category Distribution
            </div>
            {/* Visual multi-segment bar */}
            <div className="w-full h-3 rounded-full flex overflow-hidden mb-3 bg-black/5 dark:bg-white/5">
              {filteredCategorySpends.map((item) => (
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

            {/* Category Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredCategorySpends.map((item) => (
                <div
                  key={item.category.id}
                  className="p-2.5 rounded-xl flex items-center justify-between border text-xs"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: `${colors.outline}20`,
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.category.color }}
                    />
                    <span className="font-medium truncate" style={{ color: colors.onSurface }}>
                      {item.category.name}
                    </span>
                  </div>
                  <div className="font-bold flex-shrink-0" style={{ color: colors.onSurface }}>
                    {currency}
                    {item.total.toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions List in Selected Period */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider opacity-65 mb-3 flex items-center justify-between">
            <span>Transactions ({filteredExpenses.length})</span>
            {filteredExpenses.length > 0 && (
              <span className="text-[11px] font-normal opacity-70">
                Sorted by most recent
              </span>
            )}
          </div>

          {filteredExpenses.length === 0 ? (
            <div
              className="p-8 rounded-2xl text-center border border-dashed flex flex-col items-center justify-center gap-2"
              style={{
                backgroundColor: colors.surface,
                borderColor: `${colors.outline}40`,
              }}
            >
              <DollarSign size={28} className="opacity-40" />
              <div className="text-sm font-semibold opacity-80">
                No expenses logged for {filter.label}
              </div>
              <p className="text-xs opacity-50 max-w-sm">
                Tap the button below to quickly add an expense for this date.
              </p>
              {onAddExpenseForDate && (
                <button
                  onClick={() => onAddExpenseForDate(filter.startDate || formatDate(new Date()))}
                  className="mt-2 px-4 py-2 rounded-full text-xs font-semibold border"
                  style={{
                    backgroundColor: colors.primaryContainer,
                    color: colors.onPrimaryContainer,
                    borderColor: colors.primary,
                  }}
                >
                  + Add Expense for {filter.startDate}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3.5 rounded-2xl flex items-center justify-between transition-all hover:translate-x-0.5 border"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: `${colors.outline}20`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${colors.primaryContainer}88`,
                        color: colors.primary,
                      }}
                    >
                      <CategoryIcon name="DollarSign" size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: colors.onSurface }}>
                        {exp.title}
                      </div>
                      <div className="text-xs opacity-60 flex items-center gap-2 mt-0.5">
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
                      {onEditExpense && (
                        <button
                          onClick={() => onEditExpense(exp)}
                          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                      )}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
