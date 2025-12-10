import { Receipt, Plus, Camera, DollarSign } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card, Button } from '../components/ui';

/**
 * ExpenseTracker - Track job expenses and receipts
 *
 * Placeholder page for expense tracking functionality.
 * Future features:
 * - Capture receipts with camera
 * - Categorize by project/trade
 * - Track materials, labor, equipment
 * - Export for accounting
 */
export function ExpenseTracker() {
  return (
    <PageContainer
      title="Expense Tracker"
      subtitle="Track job expenses and receipts"
      icon={Receipt}
    >
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
          <Receipt className="w-10 h-10 text-amber-500" />
        </div>

        <h2 className="text-xl font-semibold text-charcoal mb-2">
          Expense Tracking Coming Soon
        </h2>

        <p className="text-gray-500 text-center max-w-md mb-8">
          Track receipts, materials, and job expenses. Snap photos of receipts
          and categorize spending by project and trade.
        </p>

        <Card className="w-full max-w-md p-6">
          <h3 className="font-medium text-charcoal mb-4">Planned Features</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Camera className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-charcoal">Receipt Capture</p>
                <p className="text-xs text-gray-500">Snap photos and auto-extract details</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-charcoal">Cost Tracking</p>
                <p className="text-xs text-gray-500">Materials, labor, equipment, and overhead</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Plus className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-charcoal">Quick Entry</p>
                <p className="text-xs text-gray-500">Add expenses on the go from any project</p>
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </PageContainer>
  );
}

export default ExpenseTracker;
