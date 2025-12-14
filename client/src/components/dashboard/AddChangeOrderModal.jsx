import { useState } from 'react';
import { X, DollarSign, Calendar, FileText, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import {
  CHANGE_ORDER_REASONS,
  addChangeOrder,
  formatCurrency,
} from '../../lib/changeOrders';

/**
 * AddChangeOrderModal - Modal for creating new change orders
 */
export function AddChangeOrderModal({ isOpen, onClose, projectId, onChangeOrderAdded }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    isCredit: false, // false = addition to contract, true = credit/reduction
    reason: 'client_request',
    scopeImpact: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const amount = parseFloat(formData.amount);
    const finalAmount = formData.isCredit ? -amount : amount;

    const changeOrder = addChangeOrder({
      projectId,
      title: formData.title.trim(),
      description: formData.description.trim(),
      amount: finalAmount,
      reason: formData.reason,
      scopeImpact: formData.scopeImpact.trim(),
      dateSubmitted: formData.date,
      status: 'pending',
    });

    onChangeOrderAdded?.(changeOrder);
    onClose();

    // Reset form
    setFormData({
      title: '',
      description: '',
      amount: '',
      isCredit: false,
      reason: 'client_request',
      scopeImpact: '',
      date: new Date().toISOString().split('T')[0],
    });
    setErrors({});
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      amount: '',
      isCredit: false,
      reason: 'client_request',
      scopeImpact: '',
      date: new Date().toISOString().split('T')[0],
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const previewAmount = formData.amount ? parseFloat(formData.amount) : 0;
  const displayAmount = formData.isCredit ? -previewAmount : previewAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-xl shadow-elevated max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-charcoal">New Change Order</h2>
            <p className="text-xs text-gray-500">Request modification to contract scope or price</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Add under-cabinet lighting"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Amount and Type row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleChange('isCredit', false)}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
                    !formData.isCredit
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('isCredit', true)}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                    formData.isCredit
                      ? 'bg-red-100 text-red-700'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  Credit
                </button>
              </div>
            </div>
          </div>

          {/* Amount Preview */}
          {previewAmount > 0 && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              formData.isCredit
                ? 'bg-red-50 border border-red-200'
                : 'bg-emerald-50 border border-emerald-200'
            }`}>
              {formData.isCredit ? (
                <TrendingDown className="w-4 h-4 text-red-600" />
              ) : (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              )}
              <span className={`text-sm font-medium ${
                formData.isCredit ? 'text-red-700' : 'text-emerald-700'
              }`}>
                Contract {formData.isCredit ? 'reduction' : 'addition'}: {formatCurrency(displayAmount)}
              </span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <select
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {CHANGE_ORDER_REASONS.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Submitted
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the change in detail..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Scope Impact (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scope Impact
              <span className="text-xs text-gray-400 font-normal ml-2">(optional)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={formData.scopeImpact}
                onChange={(e) => handleChange('scopeImpact', e.target.value)}
                placeholder="How does this affect the project scope, timeline, or other work?"
                rows={2}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Info notice */}
          <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Change orders require client approval before affecting the contract value.
              You can approve or decline pending change orders from the budget tracker.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Submit Change Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddChangeOrderModal;
