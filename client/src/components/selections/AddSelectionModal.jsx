import { useState, useEffect, useMemo } from 'react';
// Material Selection Modal Component
import { X } from 'lucide-react';
import { Button, Select } from '../ui';
import { createMaterialSelection, updateMaterialSelection } from '../../services/api';

export function AddSelectionModal({
  isOpen,
  onClose,
  projectId,
  selection,
  prefilled,
  onAdd,
  onUpdate,
  categories = [],
  statuses = [],
  phases = [],
  trades = [],
  rooms = [],
}) {
  const isEditing = !!selection;

  const [formData, setFormData] = useState({
    categoryCode: '',
    subcategoryCode: '',
    itemName: '',
    manufacturer: '',
    modelNumber: '',
    color: '',
    finish: '',
    material: '',
    dimensions: '',
    roomId: '',
    tradeCode: '',
    phaseCode: '',
    status: 'pending',
    supplierName: '',
    supplierUrl: '',
    costPerUnit: '',
    quantity: 1,
    unitOfMeasurement: 'ea',
    allowanceAmount: '',
    notes: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (selection) {
      setFormData({
        categoryCode: selection.categoryCode || '',
        subcategoryCode: selection.subcategoryCode || '',
        itemName: selection.itemName || '',
        manufacturer: selection.manufacturer || '',
        modelNumber: selection.modelNumber || '',
        color: selection.color || '',
        finish: selection.finish || '',
        material: selection.material || '',
        dimensions: selection.dimensions || '',
        roomId: selection.roomId || '',
        tradeCode: selection.tradeCode || '',
        phaseCode: selection.phaseCode || '',
        status: selection.status || 'pending',
        supplierName: selection.supplierName || '',
        supplierUrl: selection.supplierUrl || '',
        costPerUnit: selection.costPerUnit || '',
        quantity: selection.quantity || 1,
        unitOfMeasurement: selection.unitOfMeasurement || 'ea',
        allowanceAmount: selection.allowanceAmount || '',
        notes: selection.notes || '',
      });
    } else if (prefilled) {
      // Prefill from suggestion
      setFormData({
        categoryCode: prefilled.categoryCode || '',
        subcategoryCode: prefilled.subcategoryCode || '',
        itemName: '',
        manufacturer: '',
        modelNumber: '',
        color: '',
        finish: '',
        material: '',
        dimensions: '',
        roomId: '',
        tradeCode: '',
        phaseCode: '',
        status: 'pending',
        supplierName: '',
        supplierUrl: '',
        costPerUnit: '',
        quantity: 1,
        unitOfMeasurement: 'ea',
        allowanceAmount: '',
        notes: '',
      });
    } else {
      // Reset form for new selection
      setFormData({
        categoryCode: '',
        subcategoryCode: '',
        itemName: '',
        manufacturer: '',
        modelNumber: '',
        color: '',
        finish: '',
        material: '',
        dimensions: '',
        roomId: '',
        tradeCode: '',
        phaseCode: '',
        status: 'pending',
        supplierName: '',
        supplierUrl: '',
        costPerUnit: '',
        quantity: 1,
        unitOfMeasurement: 'ea',
        allowanceAmount: '',
        notes: '',
      });
    }
    setError('');
  }, [selection, prefilled, isOpen]);

  // Category options
  const categoryOptions = useMemo(() => [
    { value: '', label: 'Select Category' },
    ...categories.map(c => ({ value: c.code, label: c.name })),
  ], [categories]);

  // Subcategory options based on selected category
  const subcategoryOptions = useMemo(() => {
    const category = categories.find(c => c.code === formData.categoryCode);
    if (!category?.subcategories) return [{ value: '', label: 'Select Subcategory' }];
    return [
      { value: '', label: 'Select Subcategory' },
      ...category.subcategories.map(s => ({ value: s.code, label: s.name })),
    ];
  }, [categories, formData.categoryCode]);

  // Room options
  const roomOptions = useMemo(() => [
    { value: '', label: 'Select Room (optional)' },
    ...rooms.map(r => ({ value: r.id, label: r.name })),
  ], [rooms]);

  // Trade options
  const tradeOptions = useMemo(() => [
    { value: '', label: 'Select Trade (optional)' },
    ...trades.map(t => ({ value: t.code, label: t.name })),
  ], [trades]);

  // Phase options
  const phaseOptions = useMemo(() => [
    { value: '', label: 'Select Phase (optional)' },
    ...phases.map(p => ({ value: p.code, label: p.name })),
  ], [phases]);

  // Status options
  const statusOptions = useMemo(() =>
    statuses.map(s => ({ value: s.code, label: s.name })),
  [statuses]);

  // Unit options
  const unitOptions = [
    { value: 'ea', label: 'Each' },
    { value: 'sf', label: 'Sq Ft' },
    { value: 'lf', label: 'Lin Ft' },
    { value: 'sy', label: 'Sq Yd' },
    { value: 'box', label: 'Box' },
    { value: 'case', label: 'Case' },
    { value: 'set', label: 'Set' },
    { value: 'pair', label: 'Pair' },
  ];

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Reset subcategory when category changes
      if (field === 'categoryCode') {
        updated.subcategoryCode = '';
      }
      return updated;
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.categoryCode) {
      setError('Please select a category');
      return;
    }
    if (!formData.subcategoryCode) {
      setError('Please select a subcategory');
      return;
    }
    if (!formData.itemName.trim()) {
      setError('Please enter an item name');
      return;
    }

    setSaving(true);
    setError('');

    // Prepare data
    const submitData = {
      ...formData,
      costPerUnit: formData.costPerUnit ? parseFloat(formData.costPerUnit) : 0,
      quantity: parseInt(formData.quantity) || 1,
      allowanceAmount: formData.allowanceAmount ? parseFloat(formData.allowanceAmount) : 0,
    };

    try {
      if (isEditing) {
        const { data, error: apiError } = await updateMaterialSelection(projectId, selection.id, submitData);
        if (apiError) {
          setError(apiError);
        } else if (data) {
          onUpdate(data);
        }
      } else {
        const { data, error: apiError } = await createMaterialSelection(projectId, submitData);
        if (apiError) {
          setError(apiError);
        } else if (data) {
          onAdd(data);
        }
      }
    } catch (err) {
      setError('Failed to save selection');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-charcoal">
            {isEditing ? 'Edit Selection' : 'Add Selection'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Category & Subcategory */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <Select
                  value={formData.categoryCode}
                  onChange={(v) => handleChange('categoryCode', v)}
                  options={categoryOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory *
                </label>
                <Select
                  value={formData.subcategoryCode}
                  onChange={(v) => handleChange('subcategoryCode', v)}
                  options={subcategoryOptions}
                  disabled={!formData.categoryCode}
                />
              </div>
            </div>

            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e) => handleChange('itemName', e.target.value)}
                placeholder="e.g., Kitchen Faucet, LVP Flooring, Pendant Light"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Manufacturer & Model */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => handleChange('manufacturer', e.target.value)}
                  placeholder="e.g., Delta, Kohler, Shaw"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model Number
                </label>
                <input
                  type="text"
                  value={formData.modelNumber}
                  onChange={(e) => handleChange('modelNumber', e.target.value)}
                  placeholder="e.g., 9159-DST"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Color, Finish, Material */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  placeholder="e.g., Matte Black"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Finish
                </label>
                <input
                  type="text"
                  value={formData.finish}
                  onChange={(e) => handleChange('finish', e.target.value)}
                  placeholder="e.g., Brushed Nickel"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material
                </label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => handleChange('material', e.target.value)}
                  placeholder="e.g., Stainless Steel"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dimensions
              </label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => handleChange('dimensions', e.target.value)}
                placeholder="e.g., 32 x 19 x 10 inches, 7in wide plank"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Room, Trade, Phase */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room
                </label>
                <Select
                  value={formData.roomId}
                  onChange={(v) => handleChange('roomId', v)}
                  options={roomOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trade
                </label>
                <Select
                  value={formData.tradeCode}
                  onChange={(v) => handleChange('tradeCode', v)}
                  options={tradeOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phase
                </label>
                <Select
                  value={formData.phaseCode}
                  onChange={(v) => handleChange('phaseCode', v)}
                  options={phaseOptions}
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={formData.status}
                onChange={(v) => handleChange('status', v)}
                options={statusOptions}
              />
            </div>

            {/* Supplier Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name
                </label>
                <input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => handleChange('supplierName', e.target.value)}
                  placeholder="e.g., Home Depot, Build.com"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier URL
                </label>
                <input
                  type="url"
                  value={formData.supplierUrl}
                  onChange={(e) => handleChange('supplierUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Cost & Quantity */}
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Per Unit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costPerUnit}
                    onChange={(e) => handleChange('costPerUnit', e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <Select
                  value={formData.unitOfMeasurement}
                  onChange={(v) => handleChange('unitOfMeasurement', v)}
                  options={unitOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowance
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.allowanceAmount}
                    onChange={(e) => handleChange('allowanceAmount', e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                placeholder="Additional notes, alternatives considered, etc."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Selection'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AddSelectionModal;
