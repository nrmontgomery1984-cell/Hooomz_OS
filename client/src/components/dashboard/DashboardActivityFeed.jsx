import { useState } from 'react';
import {
  MessageSquare,
  FileText,
  Camera,
  CheckCircle2,
  DollarSign,
  RefreshCw,
  Plus,
  Filter,
} from 'lucide-react';
import { Card, Button } from '../ui';
import { formatRelativeTime } from '../../lib/dashboardHelpers';

/**
 * DashboardActivityFeed - Recent project activity
 */
export function DashboardActivityFeed({ activities, onAddNote, maxItems = 10 }) {
  const [filter, setFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'note', label: 'Notes' },
    { id: 'photo', label: 'Photos' },
    { id: 'change_order', label: 'Changes' },
    { id: 'task_complete', label: 'Tasks' },
  ];

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.type === filter);

  const visibleActivities = filteredActivities.slice(0, maxItems);

  return (
    <Card className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-charcoal flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-gray-400" />
          Activity
        </h3>
        <Button variant="secondary" size="sm" onClick={onAddNote} className="text-xs">
          <Plus className="w-3 h-3 mr-1" />
          Note
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`
              px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors
              ${filter === f.id
                ? 'bg-charcoal text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {visibleActivities.length > 0 ? (
          visibleActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <RefreshCw className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No activity yet</p>
          </div>
        )}
      </div>

      {/* Show more */}
      {filteredActivities.length > maxItems && (
        <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 text-center">
          View all {filteredActivities.length} activities
        </button>
      )}
    </Card>
  );
}

/**
 * ActivityItem - Single activity entry
 */
function ActivityItem({ activity }) {
  const typeConfig = {
    note: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
    message: { icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50' },
    change_order: { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
    photo: { icon: Camera, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    status_change: { icon: RefreshCw, color: 'text-gray-500', bg: 'bg-gray-50' },
    task_complete: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    payment: { icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
  };

  const config = typeConfig[activity.type] || typeConfig.note;
  const Icon = config.icon;

  return (
    <div className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`p-1.5 rounded-lg ${config.bg} flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-charcoal">{activity.content}</p>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
          <span>{activity.actor}</span>
          <span>•</span>
          <span>{formatRelativeTime(activity.timestamp)}</span>
        </div>

        {/* Photo thumbnails */}
        {activity.type === 'photo' && activity.metadata?.urls && (
          <div className="flex gap-1 mt-2">
            {activity.metadata.urls.slice(0, 3).map((url, index) => (
              <div
                key={index}
                className="w-12 h-12 rounded bg-gray-200 overflow-hidden"
              >
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {activity.metadata.urls.length > 3 && (
              <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                +{activity.metadata.urls.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Change order amount */}
        {activity.type === 'change_order' && activity.metadata?.amount && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
            ${activity.metadata.amount.toLocaleString()}
          </span>
        )}

        {/* Payment amount */}
        {activity.type === 'payment' && activity.metadata?.amount && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
            ${activity.metadata.amount.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * ActivityFeedCompact - Smaller activity view
 */
export function ActivityFeedCompact({ activities }) {
  const recent = activities.slice(0, 3);

  return (
    <div className="p-3 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">Recent Activity</span>
        <span className="text-xs text-gray-400">{activities.length} total</span>
      </div>

      {recent.length > 0 ? (
        <div className="space-y-2">
          {recent.map((activity) => (
            <div key={activity.id} className="text-xs">
              <p className="text-charcoal truncate">{activity.content}</p>
              <p className="text-gray-400">{formatRelativeTime(activity.timestamp)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">No recent activity</p>
      )}
    </div>
  );
}
