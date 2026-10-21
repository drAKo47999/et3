import React, { useState, useEffect } from 'react';
import { useExpense, formatDate } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { CategoryIcon } from '../utils/categoryIcons';
import { Expense, PaymentMethod } from '../types';
import { X, Calendar, Clock, CreditCard, FileText, Check, DollarSign } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  expenseToEdit?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  expenseToEdit,
}) => {
  const { categories, currency, addExpense, updateExpense, addCategory } = useExpense();
  const [newCatName, setNewCatName] = useState('');
  const { colors } = useTheme();

  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [date, setDate] = useState(initialDate || formatDate(new Date()));
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(String(expenseToEdit.amount));
      setTitle(expenseToEdit.title);
      setCategoryId(expenseToEdit.categoryId);
      setDate(expenseToEdit.date);
      setTime(expenseToEdit.time || '');
      setNotes(expenseToEdit.notes || '');
      setPaymentMethod(expenseToEdit.paymentMethod);
    } else {
      setAmount('');
      setTitle('');
      setCategoryId(categories[0]?.id || '');
      setDate(initialDate || formatDate(new Date()));
      const now = new Date();
      setTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      );
      setNotes('');
      setPaymentMethod('card');
    }
  }, [expenseToEdit, initialDate, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;

    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;
    const finalTitle = title.trim() || cat?.name || 'Expense';

    if (expenseToEdit) {
      updateExpense(expenseToEdit.id, {
        amount: parsed,
        title: finalTitle,
        categoryId,
        date,
        time,
        notes: notes.trim(),
        paymentMethod,
      });
    } else {
      addExpense({
        amount: parsed,
        title: finalTitle,
        categoryId,
        date,
        time,
        notes: notes.trim(),
        paymentMethod,
      });
    }

    onClose();
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div
        className="w-full max-w-lg rounded-[32px] p-6 sm:p-7 border shadow-2xl relative animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: colors.surfaceContainer,
          borderColor: `${colors.outline}30`,
          color: colors.onSurface,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm"
              style={{
                backgroundColor: colors.primaryContainer,
                color: colors.onPrimaryContainer,
              }}
            >
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <p className="text-xs opacity-65">Log your spending with custom categorization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 opacity-60"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input with big typography */}
          <div
            className="p-4 rounded-2xl border text-center relative"
            style={{
              backgroundColor: colors.surface,
              borderColor: `${colors.outline}30`,
            }}
          >
            <label className="block text-[11px] font-bold uppercase tracking-wider opacity-60 mb-1">
              Amount Spent
            </label>
            <div className="flex items-center justify-center">
              <span className="text-2xl font-bold opacity-60 mr-1">{currency}</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-48 text-3xl sm:text-4xl font-black text-center bg-transparent outline-none tracking-tight"
                style={{ color: colors.onSurface }}
              />
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-semibold mb-1 opacity-70">
              Title / Description
            </label>
            <input
              type="text"
              placeholder="e.g. Grocery store, Sushi lunch, Coffee"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none focus:ring-2"
              style={{
                backgroundColor: colors.surface,
                borderColor: `${colors.outline}40`,
                color: colors.onSurface,
              }}
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 opacity-70">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1.5 rounded-2xl border scrollbar-thin"
              style={{
                backgroundColor: colors.surface,
                borderColor: `${colors.outline}20`,
              }}
            >
              {categories.length === 0 && (
                <div className="col-span-full p-2 space-y-2">
                  <p className="text-xs opacity-70">No categories yet. Create your first one:</p>
                  <div className="flex gap-2">
                    <input
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g. Food"
                      className="flex-1 min-w-0 px-3 py-2 rounded-xl text-xs border bg-transparent outline-none"
                      style={{ borderColor: `${colors.outline}40` }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const name = newCatName.trim();
                        if (!name) return;
                        const c = addCategory({ name, icon: 'CircleDot', color: colors.primary });
                        setCategoryId(c.id);
                        setNewCatName('');
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold"
                      style={{ backgroundColor: colors.primary, color: colors.onPrimary }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
              {categories.map((cat) => {
                const isSelected = cat.id === categoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className="p-2 rounded-xl flex items-center gap-2 text-left border transition-all text-xs"
                    style={{
                      backgroundColor: isSelected ? colors.primaryContainer : 'transparent',
                      borderColor: isSelected ? colors.primary : 'transparent',
                      color: isSelected ? colors.onPrimaryContainer : colors.onSurface,
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <CategoryIcon name={cat.icon} size={15} />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-70 flex items-center gap-1">
                <Calendar size={13} />
                <span>Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border outline-none cursor-pointer"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: `${colors.outline}35`,
                  color: colors.onSurface,
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 opacity-70 flex items-center gap-1">
                <Clock size={13} />
                <span>Time (Optional)</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border outline-none cursor-pointer"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: `${colors.outline}35`,
                  color: colors.onSurface,
                }}
              />
            </div>
          </div>

          {/* Payment Method Pills */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 opacity-70 flex items-center gap-1">
              <CreditCard size={13} />
              <span>Payment Method</span>
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'card', label: 'Credit/Debit Card' },
                { id: 'upi', label: 'UPI / Online' },
                { id: 'cash', label: 'Cash' },
                { id: 'bank_transfer', label: 'Bank Transfer' },
                { id: 'other', label: 'Other' },
              ].map((method) => {
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all flex-shrink-0"
                    style={{
                      backgroundColor: isSelected ? colors.primaryContainer : colors.surface,
                      borderColor: isSelected ? colors.primary : `${colors.outline}25`,
                      color: isSelected ? colors.onPrimaryContainer : colors.onSurface,
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {method.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold mb-1 opacity-70 flex items-center gap-1">
              <FileText size={13} />
              <span>Notes / Tags (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Receipt #4092, split with Sarah"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs border outline-none"
              style={{
                backgroundColor: colors.surface,
                borderColor: `${colors.outline}35`,
                color: colors.onSurface,
              }}
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t" style={{ borderColor: `${colors.outline}20` }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-semibold hover:bg-black/5 opacity-70"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0}
              className="px-6 py-2.5 rounded-full text-xs font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-40"
              style={{
                backgroundColor: colors.primary,
                color: colors.onPrimary,
              }}
            >
              {expenseToEdit ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
