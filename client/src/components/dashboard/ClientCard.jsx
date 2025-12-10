import { User, AlertCircle, Clock, Send, ChevronRight } from 'lucide-react';
import { Card, Button } from '../ui';
import { ContactButtons, PreferredContactBadge } from './QuickContactButton';
import { formatDate } from '../../lib/dashboardHelpers';

/**
 * ClientCard - Contact information + decision tracking
 */
export function ClientCard({ clientData, onRequestDecision }) {
  const { client, pendingDecisions, daysSinceContact } = clientData;

  return (
    <Card className="p-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-charcoal flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          Client
        </h3>
        {pendingDecisions.length > 0 && (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            {pendingDecisions.length} pending
          </span>
        )}
      </div>

      {/* Client Info */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-medium text-charcoal">{client.name}</p>
          {client.decisionMaker && client.decisionMaker !== client.name && (
            <p className="text-xs text-gray-500">Decision maker: {client.decisionMaker}</p>
          )}
          <PreferredContactBadge preferred={client.preferredContact} />
        </div>
        <ContactButtons
          phone={client.phone}
          email={client.email}
          preferred={client.preferredContact}
          size="md"
        />
      </div>

      {/* Communication Alert */}
      {daysSinceContact > 7 && (
        <div className={`
          flex items-center gap-2 p-2 rounded-lg mb-4 text-sm
          ${daysSinceContact >= 14
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
          }
        `}>
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>
            {daysSinceContact} days since last contact
            {daysSinceContact >= 14 && ' - follow up needed'}
          </span>
        </div>
      )}

      {/* Pending Decisions */}
      {pendingDecisions.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Pending Decisions</h4>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onRequestDecision?.()}
              className="text-xs"
            >
              <Send className="w-3 h-3 mr-1" />
              Request
            </Button>
          </div>

          <div className="space-y-2">
            {pendingDecisions.slice(0, 3).map((decision) => (
              <DecisionItem key={decision.id} decision={decision} />
            ))}

            {pendingDecisions.length > 3 && (
              <button className="w-full text-center text-xs text-blue-600 hover:text-blue-700 py-1">
                +{pendingDecisions.length - 3} more decisions
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-400 text-sm">
          No pending decisions
        </div>
      )}
    </Card>
  );
}

/**
 * DecisionItem - Single pending decision
 */
function DecisionItem({ decision }) {
  const isOverdue = decision.daysOverdue > 0;
  const isUrgent = decision.daysOverdue >= 3;

  return (
    <div
      className={`
        flex items-center gap-3 p-2 rounded-lg border transition-colors
        ${isUrgent
          ? 'bg-red-50 border-red-200'
          : isOverdue
            ? 'bg-amber-50 border-amber-200'
            : 'bg-gray-50 border-gray-200'
        }
      `}
    >
      {isOverdue && (
        <AlertCircle className={`w-4 h-4 flex-shrink-0 ${isUrgent ? 'text-red-500' : 'text-amber-500'}`} />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal truncate">{decision.category}</p>
        <p className="text-xs text-gray-500 truncate">{decision.description}</p>
      </div>

      <div className="text-right">
        {isOverdue ? (
          <span className={`text-xs font-medium ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>
            {decision.daysOverdue}d overdue
          </span>
        ) : (
          <span className="text-xs text-gray-500">
            Due {formatDate(decision.dueDate)}
          </span>
        )}
      </div>

      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </div>
  );
}

/**
 * ClientCardCompact - Smaller version for sidebar
 */
export function ClientCardCompact({ clientData }) {
  const { client, pendingDecisions, daysSinceContact } = clientData;
  const hasAlert = daysSinceContact > 7 || pendingDecisions.length > 0;

  return (
    <div className="p-3 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-charcoal">{client.name}</p>
            <p className="text-xs text-gray-500">{client.phone}</p>
          </div>
        </div>
        {hasAlert && (
          <AlertCircle className="w-4 h-4 text-amber-500" />
        )}
      </div>
      <ContactButtons phone={client.phone} email={client.email} preferred={client.preferredContact} size="sm" />
    </div>
  );
}
