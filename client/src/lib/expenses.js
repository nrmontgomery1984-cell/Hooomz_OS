/**
 * Expense Tracking - Hooomz
 *
 * Storage and utilities for tracking project expenses
 * TODO: Integrate with Supabase for expense data
 */

// Expense categories matching the cost catalogue
export const EXPENSE_CATEGORIES = [
  { id: 'materials', name: 'Materials', icon: 'Package' },
  { id: 'labor', name: 'Labor', icon: 'Clock' },
  { id: 'subcontractor', name: 'Subcontractor', icon: 'Users' },
  { id: 'equipment', name: 'Equipment Rental', icon: 'Truck' },
  { id: 'permits', name: 'Permits & Fees', icon: 'FileText' },
  { id: 'delivery', name: 'Delivery', icon: 'MapPin' },
  { id: 'disposal', name: 'Waste Disposal', icon: 'Trash2' },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal' },
];

// Payment methods
export const PAYMENT_METHODS = [
  { id: 'cash', name: 'Cash' },
  { id: 'check', name: 'Check' },
  { id: 'credit', name: 'Credit Card' },
  { id: 'debit', name: 'Debit Card' },
  { id: 'etransfer', name: 'E-Transfer' },
  { id: 'account', name: 'On Account' },
];

// Storage key
const STORAGE_KEY = 'hooomz_expenses';

/**
 * Load all expenses from storage
 */
export function loadExpenses() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading expenses:', error);
    return [];
  }
}

/**
 * Save expenses to storage
 */
export function saveExpenses(expenses) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving expenses:', error);
  }
}

/**
 * Get expenses for a specific project
 * Returns manually added expenses from localStorage
 * TODO: Integrate with Supabase expenses table
 */
export function getProjectExpenses(projectId) {
  // Get manually added expenses from localStorage
  const manualExpenses = loadExpenses().filter(e => e.projectId === projectId);

  // Sort by date (newest first)
  manualExpenses.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  return manualExpenses;
}

/**
 * Add a new expense
 */
export function addExpense(expense) {
  const expenses = loadExpenses();
  const newExpense = {
    ...expense,
    id: `exp-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  expenses.push(newExpense);
  saveExpenses(expenses);
  return newExpense;
}

/**
 * Update an existing expense
 */
export function updateExpense(expenseId, updates) {
  const expenses = loadExpenses();
  const index = expenses.findIndex(e => e.id === expenseId);
  if (index !== -1) {
    expenses[index] = {
      ...expenses[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveExpenses(expenses);
    return expenses[index];
  }
  return null;
}

/**
 * Delete an expense
 */
export function deleteExpense(expenseId) {
  const expenses = loadExpenses();
  const filtered = expenses.filter(e => e.id !== expenseId);
  saveExpenses(filtered);
}

/**
 * Calculate expense totals for a project
 */
export function calculateProjectExpenseTotals(projectId) {
  const expenses = getProjectExpenses(projectId);

  const totals = {
    total: 0,
    labor: 0,
    materials: 0,
    byCategory: {},
    byMonth: {},
    byVendor: {},
    count: expenses.length,
  };

  EXPENSE_CATEGORIES.forEach(cat => {
    totals.byCategory[cat.id] = 0;
  });

  expenses.forEach(expense => {
    totals.total += expense.amount;

    // Track labor vs materials separately
    if (expense.category === 'labor') {
      totals.labor += expense.amount;
    } else if (expense.category === 'materials') {
      totals.materials += expense.amount;
    }

    // By category
    if (totals.byCategory[expense.category] !== undefined) {
      totals.byCategory[expense.category] += expense.amount;
    }

    // By month
    if (expense.date) {
      const month = expense.date.substring(0, 7); // YYYY-MM
      totals.byMonth[month] = (totals.byMonth[month] || 0) + expense.amount;
    }

    // By vendor
    if (expense.vendor) {
      totals.byVendor[expense.vendor] = (totals.byVendor[expense.vendor] || 0) + expense.amount;
    }
  });

  return totals;
}

/**
 * Get expense summary comparing to budget
 */
export function getExpenseVsBudget(projectId, budgetAmount) {
  const totals = calculateProjectExpenseTotals(projectId);
  const remaining = budgetAmount - totals.total;
  const percentUsed = budgetAmount > 0 ? (totals.total / budgetAmount) * 100 : 0;

  return {
    budget: budgetAmount,
    spent: totals.total,
    remaining,
    percentUsed,
    isOverBudget: remaining < 0,
    status: percentUsed >= 100 ? 'over' : percentUsed >= 80 ? 'warning' : 'good',
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  loadExpenses,
  saveExpenses,
  getProjectExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  calculateProjectExpenseTotals,
  getExpenseVsBudget,
  formatCurrency,
  formatDate,
};
