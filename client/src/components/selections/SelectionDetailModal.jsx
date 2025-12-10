import {
  X,
  ExternalLink,
  Edit,
  Trash2,
  MapPin,
  Package,
  DollarSign,
  Calendar,
  User,
  Palette,
  Hash,
  Ruler,
  Building2,
  Clock,
} from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { haptic } from '../../utils/haptic';

export function SelectionDetailModal({
  selection,
  isOpen,
  onClose,
  getCategoryName,
  getSubcategoryName,
  getRoomName,
  getTradeName,
  statuses,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  if (!isOpen || !selection) return null;

  const totalCost = (selection.costPerUnit || 0) * (selection.quantity || 1);
  const upgradeCost = totalCost - (selection.allowanceAmount || 0);

  const handleStatusChange = (newStatus) => {
    haptic('light');
    onStatusChange(selection.id, newStatus);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white rounded-xl shadow-xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-100">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-charcoal truncate">
                {selection.itemName}
              </h2>
              {selection.supplierUrl && (
                <a
                  href={selection.supplierUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {getCategoryName(selection.categoryCode)} &gt; {getSubcategoryName(selection.categoryCode, selection.subcategoryCode)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { onEdit(); onClose(); }}
              className="p-2 text-gray-500 hover:text-charcoal hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => { onDelete(); onClose(); }}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-charcoal hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Status & Cost Summary */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            {/* Status - tap to cycle, long-press for menu */}
            <StatusBadge
              status={selection.status}
              customStatuses={statuses}
              onChange={handleStatusChange}
            />

            {/* Cost */}
            <div className="text-right">
              {totalCost > 0 ? (
                <>
                  <p className="text-xl font-semibold text-charcoal">${totalCost.toLocaleString()}</p>
                  {selection.allowanceAmount > 0 && (
                    <p className="text-xs text-gray-500">
                      Allowance: ${selection.allowanceAmount.toLocaleString()}
                      {upgradeCost > 0 && (
                        <span className="text-amber-600 ml-1">(+${upgradeCost.toLocaleString()} upgrade)</span>
                      )}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">No price set</p>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Product Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {selection.manufacturer && (
                <DetailItem icon={Building2} label="Manufacturer" value={selection.manufacturer} />
              )}
              {selection.modelNumber && (
                <DetailItem icon={Hash} label="Model / SKU" value={selection.modelNumber} />
              )}
              {selection.color && (
                <DetailItem icon={Palette} label="Color / Finish" value={selection.color} />
              )}
              {selection.dimensions && (
                <DetailItem icon={Ruler} label="Dimensions" value={selection.dimensions} />
              )}
              {selection.quantity && (
                <DetailItem
                  icon={Package}
                  label="Quantity"
                  value={`${selection.quantity} ${selection.unitOfMeasurement || 'units'}`}
                />
              )}
              {selection.costPerUnit > 0 && selection.quantity > 1 && (
                <DetailItem
                  icon={DollarSign}
                  label="Unit Price"
                  value={`$${selection.costPerUnit.toLocaleString()} / ${selection.unitOfMeasurement || 'unit'}`}
                />
              )}
            </div>
          </div>

          {/* Location & Trade */}
          {(selection.roomId || selection.tradeCode) && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Location & Trade</h3>
              <div className="grid grid-cols-2 gap-4">
                {selection.roomId && (
                  <DetailItem icon={MapPin} label="Room" value={getRoomName(selection.roomId)} />
                )}
                {selection.tradeCode && (
                  <DetailItem icon={User} label="Trade" value={getTradeName(selection.tradeCode)} />
                )}
              </div>
            </div>
          )}

          {/* Supplier Info */}
          {(selection.supplier || selection.supplierUrl || selection.leadTimeDays) && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Supplier Info</h3>
              <div className="grid grid-cols-2 gap-4">
                {selection.supplier && (
                  <DetailItem icon={Building2} label="Supplier" value={selection.supplier} />
                )}
                {selection.leadTimeDays && (
                  <DetailItem icon={Clock} label="Lead Time" value={`${selection.leadTimeDays} days`} />
                )}
              </div>
              {selection.supplierUrl && (
                <a
                  href={selection.supplierUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Product Page
                </a>
              )}
            </div>
          )}

          {/* Important Dates */}
          {(selection.neededByDate || selection.orderedDate || selection.expectedDeliveryDate) && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Important Dates</h3>
              <div className="grid grid-cols-2 gap-4">
                {selection.neededByDate && (
                  <DetailItem icon={Calendar} label="Needed By" value={formatDate(selection.neededByDate)} />
                )}
                {selection.orderedDate && (
                  <DetailItem icon={Calendar} label="Ordered On" value={formatDate(selection.orderedDate)} />
                )}
                {selection.expectedDeliveryDate && (
                  <DetailItem icon={Calendar} label="Expected Delivery" value={formatDate(selection.expectedDeliveryDate)} />
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {selection.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Notes</h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{selection.notes}</p>
              </div>
            </div>
          )}

          {/* Alternatives */}
          {selection.alternatives && selection.alternatives.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                Alternatives Considered ({selection.alternatives.length})
              </h3>
              <div className="space-y-2">
                {selection.alternatives.map((alt, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-charcoal">{alt.name}</span>
                      {alt.price && (
                        <span className="text-sm text-gray-500">${alt.price.toLocaleString()}</span>
                      )}
                    </div>
                    {alt.reason && (
                      <p className="text-xs text-gray-500 mt-1">{alt.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Created {formatDate(selection.createdAt)}</span>
              {selection.updatedAt && selection.updatedAt !== selection.createdAt && (
                <span>Updated {formatDate(selection.updatedAt)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => { onEdit(); onClose(); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-charcoal bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Selection
          </button>
          {selection.supplierUrl && (
            <a
              href={selection.supplierUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Product
            </a>
          )}
        </div>
      </div>
    </>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-charcoal">{value}</p>
      </div>
    </div>
  );
}
