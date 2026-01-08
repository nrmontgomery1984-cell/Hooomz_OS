import { useState, useEffect } from 'react';
import { Receipt, Plus, Camera, DollarSign, Filter, Calendar, Building2, Tag, Trash2, Edit2 } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card, Button, Modal, Input, Select } from '../components/ui';
import { getProjects } from '../services/api';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { useToast } from '../components/ui';

// Local storage key for expenses
const EXPENSES_KEY = 'hooomz-expenses';

// Expense categories
const EXPENSE_CATEGORIES = [
  { value: 'materials', label: 'Materials' },
  { value: 'labor', label: 'Labor' },
  { value: 'equipment', label: 'Equipment Rental' },
  { value: 'tools', label: 'Tools' },
  { value: 'permits', label: 'Permits & Fees' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'fuel', label: 'Fuel & Travel' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'other', label: 'Other' },
];

/**
 * ExpenseTracker - Track job expenses and receipts
 */
export function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterProject, setFilterProject] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const { confirm } = useConfirmDialog();
  const { showToast } = useToast();

  // Load expenses from localStorage and projects from API
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Load expenses from localStorage
      try {
        const saved = localStorage.getItem(EXPENSES_KEY);
        if (saved) {
          setExpenses(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Failed to load expenses:', err);
      }

      // Load projects
      const { data } = await getProjects();
      setProjects(data || []);

      setLoading(false);
    }
    loadData();
  }, []);

  // Save expenses to localStorage
  const saveExpenses = (newExpenses) => {
    setExpenses(newExpenses);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(newExpenses));
  };

  // Add or update expense
  const handleSaveExpense = (expenseData) => {
    if (editingExpense) {
      const updated = expenses.map(e =>
        e.id === editingExpense.id ? { ...e, ...expenseData, updated_at: new Date().toISOString() } : e
      );
      saveExpenses(updated);
      showToast('Expense updated', 'success');
    } else {
      const newExpense = {
        id: `exp-${Date.now()}`,
        ...expenseData,
        created_at: new Date().toISOString(),
      };
      saveExpenses([newExpense, ...expenses]);
      showToast('Expense added', 'success');
    }
    setShowAddModal(false);
    setEditingExpense(null);
  };

  // Delete expense
  const handleDeleteExpense = async (expense) => {
    const confirmed = await confirm({
      title: 'Delete Expense',
      message: `Delete "${expense.description}"? This cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    });

    if (confirmed) {
      const updated = expenses.filter(e => e.id !== expense.id);
      saveExpenses(updated);
      showToast('Expense deleted', 'success');
    }
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    if (filterProject !== 'all' && expense.project_id !== filterProject) return false;
    if (filterCategory !== 'all' && expense.category !== filterCategory) return false;
    return true;
  });

  // Calculate totals
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const categoryTotals = filteredExpenses.reduce((acc, e) => {
    const cat = e.category || 'other';
    acc[cat] = (acc[cat] || 0) + (parseFloat(e.amount) || 0);
    return acc;
  }, {});

  const projectOptions = [
    { value: 'all', label: 'All Projects' },
    ...projects.map(p => ({ value: p.id, label: p.name || p.client_name })),
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...EXPENSE_CATEGORIES,
  ];

  return (
    <PageContainer
      title="Expense Tracker"
      subtitle="Track job expenses and receipts"
      action={
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Expense
        </Button>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-charcoal">${totalAmount.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total Expenses</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{filteredExpenses.length}</p>
          <p className="text-xs text-gray-500">Entries</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">
            ${(categoryTotals.materials || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">Materials</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-green-600">
            ${(categoryTotals.labor || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">Labor</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <Select
            value={filterProject}
            onChange={setFilterProject}
            options={projectOptions}
            placeholder="Filter by project"
          />
        </div>
        <div className="flex-1">
          <Select
            value={filterCategory}
            onChange={setFilterCategory}
            options={categoryOptions}
            placeholder="Filter by category"
          />
        </div>
      </div>

      {/* Expenses List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-20 animate-pulse" />
          ))}
        </div>
      ) : filteredExpenses.length === 0 ? (
        <Card className="p-8 text-center">
          <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No expenses yet</p>
          <p className="text-sm text-gray-400 mb-4">
            Start tracking your job expenses
          </p>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            Add First Expense
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              projects={projects}
              onEdit={() => {
                setEditingExpense(expense);
                setShowAddModal(true);
              }}
              onDelete={() => handleDeleteExpense(expense)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <ExpenseModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        expense={editingExpense}
        projects={projects}
      />
    </PageContainer>
  );
}

function ExpenseCard({ expense, projects, onEdit, onDelete }) {
  const project = projects.find(p => p.id === expense.project_id);
  const category = EXPENSE_CATEGORIES.find(c => c.value === expense.category);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-charcoal">{expense.description}</h4>
            {category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {category.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {project && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {project.name || project.client_name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(expense.date || expense.created_at).toLocaleDateString()}
            </span>
          </div>
          {expense.notes && (
            <p className="text-sm text-gray-500 mt-2">{expense.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-charcoal">
            ${parseFloat(expense.amount).toLocaleString()}
          </span>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}

function ExpenseModal({ isOpen, onClose, onSave, expense, projects }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('materials');
  const [projectId, setProjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Reset form when expense changes
  useEffect(() => {
    if (expense) {
      setDescription(expense.description || '');
      setAmount(expense.amount?.toString() || '');
      setCategory(expense.category || 'materials');
      setProjectId(expense.project_id || '');
      setDate(expense.date || new Date().toISOString().split('T')[0]);
      setNotes(expense.notes || '');
    } else {
      setDescription('');
      setAmount('');
      setCategory('materials');
      setProjectId('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [expense, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      description,
      amount: parseFloat(amount),
      category,
      project_id: projectId || null,
      date,
      notes,
    });
  };

  const projectOptions = [
    { value: '', label: 'No project' },
    ...projects.map(p => ({ value: p.id, label: p.name || p.client_name })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={expense ? 'Edit Expense' : 'Add Expense'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Lumber for framing"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <Select
            value={category}
            onChange={setCategory}
            options={EXPENSE_CATEGORIES}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <Select
            value={projectId}
            onChange={setProjectId}
            options={projectOptions}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional details..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            rows={2}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={!description || !amount}>
            {expense ? 'Update' : 'Add'} Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ExpenseTracker;
