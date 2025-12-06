import { useState } from 'react';
import {
  Package,
  Users,
  Truck,
  FileText,
  MapPin,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash,
  Store,
} from 'lucide-react';
import { EXPENSE_CATEGORIES, formatCurrency, formatDate, deleteExpense } from '../../lib/expenses';

const CATEGORY_ICONS = {
  materials: Package,
  labor: Users,
  equipment: Truck,
  permits: FileText,
  delivery: MapPin,
  disposal: Trash2,
  other: MoreHorizontal,
};

function ExpenseRow({ expense, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = CATEGORY_ICONS[expense.category] || Package;
  const category = EXPENSE_CATEGORIES.find(c => c.id === expense.category);

  const handleDelete = () => {
    if (window.confirm('Delete this expense?')) {
      deleteExpense(expense.id);
      onDelete(expense.id);
    }
  };

  return (
    <div className="border-b border-gray-100 last:border-0">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`p-2 rounded-lg ${
          expense.category === 'materials' ? 'bg-blue-100 text-blue-600' :
          expense.category === 'labor' ? 'bg-purple-100 text-purple-600' :
          expense.category === 'equipment' ? 'bg-amber-100 text-amber-600' :
          expense.category === 'permits' ? 'bg-green-100 text-green-600' :
          'bg-gray-100 text-gray-600'
        }`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-charcoal truncate">{expense.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{formatDate(expense.date)}</span>
            {expense.vendor && (
              <>
                <span>•</span>
                <span>{expense.vendor}</span>
              </>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="font-semibold text-charcoal">{formatCurrency(expense.amount)}</p>
          <p className="text-xs text-gray-400">{category?.name}</p>
        </div>

        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-3 pl-14 space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {expense.vendor && (
              <div>
                <span className="text-gray-500">Vendor:</span>
                <span className="ml-2 text-charcoal">{expense.vendor}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Payment:</span>
              <span className="ml-2 text-charcoal capitalize">{expense.paymentMethod?.replace('_', ' ')}</span>
            </div>
            {expense.receiptRef && (
              <div>
                <span className="text-gray-500">Receipt #:</span>
                <span className="ml-2 text-charcoal">{expense.receiptRef}</span>
              </div>
            )}
          </div>
          {expense.notes && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
              {expense.notes}
            </p>
          )}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(expense);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash className="w-3 h-3" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ExpenseList({ expenses, onDelete, onEdit, emptyMessage = 'No expenses recorded' }) {
  const [sortBy, setSortBy] = useState('date'); // date, amount, category
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('all');

  // Filter expenses
  let filtered = [...expenses];
  if (filterCategory !== 'all') {
    filtered = filtered.filter(e => e.category === filterCategory);
  }

  // Sort expenses
  filtered.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = new Date(a.date) - new Date(b.date);
    } else if (sortBy === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortBy === 'category') {
      comparison = a.category.localeCompare(b.category);
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Calculate totals
  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters and Sort */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Sort:</span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              setSortBy(by);
              setSortOrder(order);
            }}
            className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">
          {filtered.length} expense{filtered.length !== 1 ? 's' : ''}
          {filterCategory !== 'all' && ` in ${EXPENSE_CATEGORIES.find(c => c.id === filterCategory)?.name}`}
        </span>
        <span className="font-semibold text-charcoal">{formatCurrency(totalAmount)}</span>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.map(expense => (
          <ExpenseRow
            key={expense.id}
            expense={expense}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}
