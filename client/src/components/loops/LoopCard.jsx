import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Card, StatusDot, ProgressBar } from '../ui';

export function LoopCard({ loop, projectId }) {
  const navigate = useNavigate();

  const statusColors = {
    completed: 'green',
    active: loop.health_color || 'yellow',
    blocked: 'red',
    pending: 'gray',
    cancelled: 'gray',
  };

  const color = statusColors[loop.status] || 'gray';

  return (
    <Card
      hover
      className="p-4"
      onClick={() => navigate(`/projects/${projectId}/loops/${loop.id}`)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <StatusDot status={color} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-charcoal truncate">{loop.name}</h3>
            <p className="text-xs text-gray-500 capitalize">{loop.loop_type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loop.status !== 'pending' && loop.status !== 'cancelled' && (
            <span className="text-sm font-medium text-gray-600">
              {loop.health_score}%
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      {loop.status === 'active' && (
        <ProgressBar
          value={loop.health_score}
          color={color}
          className="mt-3"
        />
      )}
    </Card>
  );
}
