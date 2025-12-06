import { useState } from 'react';
import { ScanLine, AlertCircle, FileText, ArrowLeft } from 'lucide-react';
import { ReceiptUploader } from './ReceiptUploader';
import { ExtractedItemsList } from './ExtractedItemsList';
import { detectCategory, createExtractionPrompt } from '../../lib/receiptParser';

// Demo extracted items for testing when AI is not available
const DEMO_EXTRACTED_ITEMS = [
  {
    name: '2x4x8 KD SPF',
    sku: '2832427',
    quantity: 10,
    unitPrice: 3.90,
    totalPrice: 39.00,
    suggestedCategory: 'lumber',
    suggestedUnit: 'each',
  },
  {
    name: 'ROMEX 14/2 75M',
    sku: '4521100',
    quantity: 1,
    unitPrice: 89.99,
    totalPrice: 89.99,
    suggestedCategory: 'electrical',
    suggestedUnit: 'roll',
  },
  {
    name: 'GFCI Outlet 15A White',
    sku: '4523456',
    quantity: 4,
    unitPrice: 24.99,
    totalPrice: 99.96,
    suggestedCategory: 'electrical',
    suggestedUnit: 'each',
  },
  {
    name: 'Drywall 1/2" 4x8 Sheet',
    sku: '3654789',
    quantity: 20,
    unitPrice: 14.99,
    totalPrice: 299.80,
    suggestedCategory: 'drywall',
    suggestedUnit: 'sheet',
  },
  {
    name: 'Joint Compound 20kg Box',
    sku: '3654801',
    quantity: 2,
    unitPrice: 18.99,
    totalPrice: 37.98,
    suggestedCategory: 'drywall',
    suggestedUnit: 'box',
  },
];

const STEPS = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  REVIEW: 'review',
  MANUAL: 'manual',
};

export function ReceiptScanner({
  existingMaterials,
  onAddMaterial,
  onUpdateMaterial,
  onClose,
}) {
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [capturedImage, setCapturedImage] = useState(null);
  const [extractedItems, setExtractedItems] = useState([]);
  const [error, setError] = useState(null);
  const [manualText, setManualText] = useState('');

  const handleImageCapture = async (file, dataUrl) => {
    setCapturedImage(dataUrl);
    setStep(STEPS.PROCESSING);
    setError(null);

    // Simulate AI processing delay
    // In production, this would call Claude Vision API or similar
    setTimeout(() => {
      // For demo purposes, use sample data
      // In production, parse the actual receipt
      setExtractedItems(DEMO_EXTRACTED_ITEMS);
      setStep(STEPS.REVIEW);
    }, 2000);
  };

  const handleManualEntry = () => {
    setStep(STEPS.MANUAL);
  };

  const handleParseManual = () => {
    // Simple line-by-line parsing
    const lines = manualText.split('\n').filter((line) => line.trim());
    const items = [];

    for (const line of lines) {
      // Try to match pattern: "Item Name  Qty x Price  Total"
      // Or simpler: "Item Name  Price"
      const match = line.match(/^(.+?)\s+(\d+)\s*[x@]\s*\$?([\d.]+)\s*=?\s*\$?([\d.]+)?$/i);

      if (match) {
        const name = match[1].trim();
        const quantity = parseInt(match[2]);
        const unitPrice = parseFloat(match[3]);
        const totalPrice = match[4] ? parseFloat(match[4]) : quantity * unitPrice;

        items.push({
          name,
          quantity,
          unitPrice,
          totalPrice,
          suggestedCategory: detectCategory(name),
          suggestedUnit: 'each',
        });
      } else {
        // Try simpler pattern: "Item Name  $Price"
        const simpleMatch = line.match(/^(.+?)\s+\$?([\d.]+)$/);
        if (simpleMatch) {
          const name = simpleMatch[1].trim();
          const price = parseFloat(simpleMatch[2]);
          items.push({
            name,
            quantity: 1,
            unitPrice: price,
            totalPrice: price,
            suggestedCategory: detectCategory(name),
            suggestedUnit: 'each',
          });
        }
      }
    }

    if (items.length > 0) {
      setExtractedItems(items);
      setStep(STEPS.REVIEW);
    } else {
      setError('Could not parse any items. Please check the format.');
    }
  };

  const handleUseDemoData = () => {
    setExtractedItems(DEMO_EXTRACTED_ITEMS);
    setStep(STEPS.REVIEW);
  };

  const handleComplete = () => {
    onClose();
  };

  const handleBack = () => {
    if (step === STEPS.REVIEW) {
      setStep(STEPS.UPLOAD);
      setExtractedItems([]);
      setCapturedImage(null);
    } else if (step === STEPS.MANUAL) {
      setStep(STEPS.UPLOAD);
      setManualText('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Back button */}
      {(step === STEPS.REVIEW || step === STEPS.MANUAL) && (
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      {/* Upload step */}
      {step === STEPS.UPLOAD && (
        <div className="space-y-4">
          <ReceiptUploader
            onImageCapture={handleImageCapture}
            isProcessing={false}
          />

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualEntry}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Enter manually
              </span>
            </button>
            <button
              onClick={handleUseDemoData}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ScanLine className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">Use demo data</span>
            </button>
          </div>
        </div>
      )}

      {/* Processing step */}
      {step === STEPS.PROCESSING && (
        <div className="text-center py-8">
          <ReceiptUploader
            onImageCapture={handleImageCapture}
            isProcessing={true}
          />
          {capturedImage && (
            <div className="mt-4">
              <img
                src={capturedImage}
                alt="Processing"
                className="max-h-64 mx-auto rounded-lg"
              />
            </div>
          )}
        </div>
      )}

      {/* Manual entry step */}
      {step === STEPS.MANUAL && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste or type receipt items
            </label>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder={`Enter items, one per line. Examples:
2x4x8 SPF Stud  10 x $3.90  $39.00
Romex 14/2 75M  $89.99
Drywall 1/2" 4x8  20 x $14.99`}
              className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-mono"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Format:</strong> Item Name {'  '} Qty x Price {'  '} Total
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Or simply: Item Name {'  '} Price
            </p>
          </div>

          <button
            onClick={handleParseManual}
            disabled={!manualText.trim()}
            className="w-full py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Parse Items
          </button>
        </div>
      )}

      {/* Review step */}
      {step === STEPS.REVIEW && (
        <ExtractedItemsList
          items={extractedItems}
          existingMaterials={existingMaterials}
          onAddMaterial={onAddMaterial}
          onUpdateMaterial={onUpdateMaterial}
          onComplete={handleComplete}
        />
      )}

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
