import { useState, useRef } from 'react';
import { X, DollarSign, Calendar, Store, FileText, CreditCard, Camera, Upload, Trash2, Loader2, Sparkles } from 'lucide-react';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, addExpense } from '../../lib/expenses';
import { detectCategory } from '../../lib/receiptParser';

// Map material categories to expense categories
const MATERIAL_TO_EXPENSE_CATEGORY = {
  lumber: 'materials',
  drywall: 'materials',
  electrical: 'materials',
  plumbing: 'materials',
  hvac: 'materials',
  roofing: 'materials',
  insulation: 'materials',
  flooring: 'materials',
  tile: 'materials',
  paint: 'materials',
  cabinets: 'materials',
  doors_windows: 'materials',
  trim: 'materials',
  hardware: 'materials',
  exterior: 'materials',
  fixtures: 'materials',
};

// Known vendor patterns for auto-detection
const VENDOR_PATTERNS = [
  { pattern: /home\s*depot/i, name: 'Home Depot' },
  { pattern: /home\s*hardware/i, name: 'Home Hardware' },
  { pattern: /lowe'?s/i, name: "Lowe's" },
  { pattern: /rona/i, name: 'RONA' },
  { pattern: /kent/i, name: 'Kent Building Supplies' },
  { pattern: /canadian\s*tire/i, name: 'Canadian Tire' },
  { pattern: /menard'?s/i, name: "Menards" },
  { pattern: /ace\s*hardware/i, name: 'Ace Hardware' },
  { pattern: /lumber/i, name: 'Lumber Yard' },
];

/**
 * Simulate AI extraction from receipt
 * In production, this would call Claude Vision API or similar
 */
function extractReceiptData(fileName) {
  // Simulate extraction delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Demo extraction based on filename patterns
      const lowerName = fileName.toLowerCase();

      // Try to detect vendor from filename
      let vendor = '';
      for (const { pattern, name } of VENDOR_PATTERNS) {
        if (pattern.test(lowerName)) {
          vendor = name;
          break;
        }
      }

      // Generate demo data - in production this would be real AI extraction
      const demoData = {
        // If filename contains price-like patterns, try to extract
        totalAmount: null,
        vendor: vendor,
        date: new Date().toISOString().split('T')[0],
        items: [],
        invoiceNumber: '',
      };

      // Look for amount in filename (e.g., "receipt_$234.56.jpg")
      const amountMatch = lowerName.match(/\$?([\d,]+\.?\d{0,2})/);
      if (amountMatch) {
        demoData.totalAmount = parseFloat(amountMatch[1].replace(',', ''));
      }

      // Look for date patterns in filename
      const dateMatch = lowerName.match(/(\d{4}[-_]?\d{2}[-_]?\d{2})|(\d{2}[-_]?\d{2}[-_]?\d{4})/);
      if (dateMatch) {
        // Try to parse date
        const dateStr = dateMatch[0].replace(/[-_]/g, '-');
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          demoData.date = parsed.toISOString().split('T')[0];
        }
      }

      // Look for invoice number patterns
      const invoiceMatch = lowerName.match(/inv[oice#\-_]*(\d+)/i) ||
                          lowerName.match(/#(\d{4,})/);
      if (invoiceMatch) {
        demoData.invoiceNumber = invoiceMatch[1];
      }

      resolve(demoData);
    }, 1500); // Simulate processing time
  });
}

/**
 * Extract data using demo mode with realistic sample data
 */
function extractDemoData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalAmount: 347.82,
        vendor: 'Home Hardware',
        date: new Date().toISOString().split('T')[0],
        items: [
          { name: '2x4x8 KD SPF', qty: 20, price: 3.90 },
          { name: 'Drywall Screws 2"', qty: 2, price: 12.99 },
          { name: 'Joint Compound 20kg', qty: 1, price: 18.99 },
        ],
        invoiceNumber: 'INV-789456',
        description: 'Framing lumber and drywall supplies',
      });
    }, 1500);
  });
}

export function AddExpenseModal({ isOpen, onClose, projectId, onExpenseAdded }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'materials',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'credit',
    notes: '',
    receiptRef: '',
  });
  const [errors, setErrors] = useState({});
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedFields, setExtractedFields] = useState(new Set());
  const fileInputRef = useRef(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    // Remove from extracted fields if user manually changes it
    setExtractedFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isPdf) {
      alert('Please upload an image or PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setReceiptFile(file);

    // Create preview for images
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptPreview({ type: 'image', url: e.target.result, name: file.name });
      };
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview({ type: 'pdf', name: file.name });
    }

    // Start extraction
    setIsExtracting(true);
    try {
      const extracted = await extractReceiptData(file.name);

      // Auto-fill form fields
      const updates = {};
      const newExtracted = new Set();

      if (extracted.totalAmount && !formData.amount) {
        updates.amount = extracted.totalAmount.toString();
        newExtracted.add('amount');
      }

      if (extracted.vendor && !formData.vendor) {
        updates.vendor = extracted.vendor;
        newExtracted.add('vendor');
      }

      if (extracted.date) {
        updates.date = extracted.date;
        newExtracted.add('date');
      }

      if (extracted.invoiceNumber && !formData.receiptRef) {
        updates.receiptRef = extracted.invoiceNumber;
        newExtracted.add('receiptRef');
      }

      if (extracted.description && !formData.description) {
        updates.description = extracted.description;
        newExtracted.add('description');
      }

      // Auto-detect category from items or description
      if (extracted.items?.length > 0) {
        const firstItem = extracted.items[0].name;
        const materialCategory = detectCategory(firstItem);
        const expenseCategory = MATERIAL_TO_EXPENSE_CATEGORY[materialCategory] || 'materials';
        updates.category = expenseCategory;
        newExtracted.add('category');

        // Create description from items if not set
        if (!formData.description && !extracted.description) {
          if (extracted.items.length === 1) {
            updates.description = extracted.items[0].name;
          } else {
            updates.description = `${extracted.items.length} items from ${extracted.vendor || 'supplier'}`;
          }
          newExtracted.add('description');
        }
      }

      setFormData(prev => ({ ...prev, ...updates }));
      setExtractedFields(newExtracted);
    } catch (error) {
      console.error('Extraction failed:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUseDemoExtraction = async () => {
    setIsExtracting(true);
    try {
      const extracted = await extractDemoData();

      const newExtracted = new Set();
      setFormData(prev => ({
        ...prev,
        amount: extracted.totalAmount.toString(),
        vendor: extracted.vendor,
        date: extracted.date,
        receiptRef: extracted.invoiceNumber,
        description: extracted.description,
        category: 'materials',
      }));

      newExtracted.add('amount');
      newExtracted.add('vendor');
      newExtracted.add('date');
      newExtracted.add('receiptRef');
      newExtracted.add('description');
      newExtracted.add('category');

      setExtractedFields(newExtracted);
      setReceiptPreview({ type: 'demo', name: 'Demo Receipt' });
    } catch (error) {
      console.error('Demo extraction failed:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const clearReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    setExtractedFields(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const expense = addExpense({
      projectId,
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      vendor: formData.vendor.trim(),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes.trim(),
      receiptRef: formData.receiptRef.trim(),
      receiptFileName: receiptFile?.name || null,
      hasReceipt: !!receiptFile || receiptPreview?.type === 'demo',
    });

    onExpenseAdded(expense);
    onClose();

    // Reset form
    setFormData({
      description: '',
      amount: '',
      category: 'materials',
      vendor: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'credit',
      notes: '',
      receiptRef: '',
    });
    setReceiptFile(null);
    setReceiptPreview(null);
    setExtractedFields(new Set());
  };

  // Helper to show if field was auto-filled
  const isExtracted = (field) => extractedFields.has(field);
  const extractedClass = (field) => isExtracted(field)
    ? 'ring-2 ring-emerald-200 bg-emerald-50/50'
    : '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-xl shadow-elevated max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-charcoal">Add Expense</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Receipt Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt / Invoice
              <span className="text-xs text-gray-400 font-normal ml-2">
                (auto-fills form)
              </span>
            </label>
            {isExtracting ? (
              <div className="flex items-center justify-center gap-3 py-6 border-2 border-dashed border-emerald-300 rounded-lg bg-emerald-50">
                <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                <span className="text-sm text-emerald-700 font-medium">
                  Extracting receipt data...
                </span>
              </div>
            ) : receiptPreview ? (
              <div className="relative border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center gap-3">
                  {receiptPreview.type === 'image' ? (
                    <img
                      src={receiptPreview.url}
                      alt="Receipt"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : receiptPreview.type === 'demo' ? (
                    <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-emerald-500" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-red-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">
                      {receiptPreview.name}
                    </p>
                    <p className="text-xs text-emerald-600">
                      {extractedFields.size > 0
                        ? `${extractedFields.size} fields auto-filled`
                        : receiptPreview.type === 'pdf' ? 'PDF Document' : 'Image'
                      }
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearReceipt}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer">
                    <Camera className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Take Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Upload File</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,application/pdf"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleUseDemoExtraction}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Try demo extraction
                </button>
              </div>
            )}
          </div>

          {/* Extracted fields indicator */}
          {extractedFields.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-emerald-700">
                Fields highlighted in green were auto-filled from receipt
              </span>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="e.g., Lumber for framing"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } ${extractedClass('description')}`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Amount and Date row */}
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
                  } ${extractedClass('amount')}`}
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  } ${extractedClass('date')}`}
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${extractedClass('category')}`}
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor and Payment Method row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor/Supplier
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => handleChange('vendor', e.target.value)}
                  placeholder="e.g., Home Hardware"
                  className={`w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${extractedClass('vendor')}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Receipt Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Receipt/Invoice #
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.receiptRef}
                onChange={(e) => handleChange('receiptRef', e.target.value)}
                placeholder="e.g., INV-12345"
                className={`w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${extractedClass('receiptRef')}`}
              />
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
              placeholder="Additional details..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Add Expense
          </button>
        </div>
      </div>
    </div>
  );
}
