import { useState } from 'react';
import {
  X,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  User,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui';
import {
  CHANGE_ORDER_REASONS,
  approveChangeOrder,
  declineChangeOrder,
  formatCurrency,
  getStatusColors,
} from '../../lib/changeOrders';

/**
 * ChangeOrderDetailModal - View and approve/decline change orders
 */
export function ChangeOrderDetailModal({
  isOpen,
  onClose,
  changeOrder,
  onUpdate,
  viewMode = 'contractor', // 'contractor' | 'homeowner'
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);

  if (!isOpen || !changeOrder) return null;

  const isCredit = changeOrder.amount < 0;
  const absoluteAmount = Math.abs(changeOrder.amount);
  const statusColors = getStatusColors(changeOrder.status);
  const reasonLabel = CHANGE_ORDER_REASONS.find(r => r.id === changeOrder.reason)?.name || changeOrder.reason;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const approvedBy = viewMode === 'homeowner' ? 'Client' : 'Contractor';
      const updated = approveChangeOrder(changeOrder.id, approvedBy);
      onUpdate?.(updated);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim() && viewMode === 'homeowner') {
      return; // Require reason from homeowner
    }
    setIsSubmitting(true);
    try {
      const updated = declineChangeOrder(changeOrder.id, declineReason.trim());
      onUpdate?.(updated);
      onClose();
    } finally {
      setIsSubmitting(false);
      setShowDeclineForm(false);
      setDeclineReason('');
    }
  };

  const handleClose = () => {
    setShowDeclineForm(false);
    setDeclineReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-xl shadow-elevated max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-semibold text-charcoal truncate">
              {changeOrder.title || 'Change Order'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                {changeOrder.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                {changeOrder.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                {changeOrder.status === 'declined' && <XCircle className="w-3 h-3 mr-1" />}
                {changeOrder.status.charAt(0).toUpperCase() + changeOrder.status.slice(1)}
              </span>
              <span className="text-xs text-gray-500">#{changeOrder.id.slice(-6)}</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Amount */}
          <div className={`p-4 rounded-lg ${isCredit ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isCredit ? (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                )}
                <span className={`text-sm font-medium ${isCredit ? 'text-red-700' : 'text-emerald-700'}`}>
                  Contract {isCredit ? 'Credit' : 'Addition'}
                </span>
              </div>
              <span className={`text-xl font-bold ${isCredit ? 'text-red-700' : 'text-emerald-700'}`}>
                {formatCurrency(changeOrder.amount)}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Description
              </label>
              <p className="text-sm text-charcoal">
                {changeOrder.description || 'No description provided'}
              </p>
            </div>

            {/* Reason */}
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Reason
                </label>
                <p className="text-sm text-charcoal">{reasonLabel}</p>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Date Submitted
                </label>
                <p className="text-sm text-charcoal">
                  {new Date(changeOrder.dateSubmitted || changeOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Scope Impact */}
            {changeOrder.scopeImpact && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Scope Impact
                </label>
                <p className="text-sm text-charcoal">{changeOrder.scopeImpact}</p>
              </div>
            )}

            {/* Approval Info (if approved/declined) */}
            {changeOrder.status === 'approved' && changeOrder.approvedBy && (
              <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                <User className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-700">
                  Approved by {changeOrder.approvedBy} on {new Date(changeOrder.approvedAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {changeOrder.status === 'declined' && (
              <div className="p-2 bg-red-50 rounded-lg space-y-1">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">
                    Declined on {new Date(changeOrder.declinedAt).toLocaleDateString()}
                  </span>
                </div>
                {changeOrder.declinedReason && (
                  <p className="text-sm text-red-600 pl-6">{changeOrder.declinedReason}</p>
                )}
              </div>
            )}
          </div>

          {/* Decline Form (when declining) */}
          {showDeclineForm && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Decline Change Order</span>
              </div>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder={viewMode === 'homeowner' ? 'Please provide a reason for declining (required)...' : 'Reason for declining (optional)...'}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowDeclineForm(false);
                    setDeclineReason('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleDecline}
                  disabled={isSubmitting || (viewMode === 'homeowner' && !declineReason.trim())}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isSubmitting ? 'Declining...' : 'Confirm Decline'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Actions for pending change orders */}
        {changeOrder.status === 'pending' && !showDeclineForm && (
          <div className="px-4 py-3 border-t border-gray-100 space-y-3">
            {viewMode === 'homeowner' ? (
              <>
                <p className="text-xs text-gray-500 text-center">
                  Your contractor has requested this change. Please review and approve or decline.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeclineForm(true)}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {isSubmitting ? 'Approving...' : 'Approve'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500 text-center">
                  Awaiting client approval. You can manually override if needed.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeclineForm(true)}
                    className="flex-1 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {isSubmitting ? 'Approving...' : 'Approve (Override)'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Close button for non-pending */}
        {changeOrder.status !== 'pending' && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChangeOrderDetailModal;
