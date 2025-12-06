import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Card, Button } from '../ui';

export function TimeTracker({ timeEntry, onStop, onStart }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!timeEntry?.start_time) return;

    const startTime = new Date(timeEntry.start_time).getTime();

    const updateElapsed = () => {
      const now = Date.now();
      const elapsedMs = now - startTime;
      setElapsed(Math.floor(elapsedMs / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [timeEntry?.start_time]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const allocatedSeconds = (timeEntry?.allocated_minutes || 60) * 60;
  const percentage = Math.min(100, Math.round((elapsed / allocatedSeconds) * 100));

  // SVG circle calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  // Get color based on percentage
  const getColor = (pct) => {
    if (pct >= 90) return '#ef4444'; // red
    if (pct >= 75) return '#f59e0b'; // yellow
    return '#10b981'; // green
  };

  if (!timeEntry) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500 text-sm mb-4">No active timer</p>
        {onStart && (
          <Button onClick={onStart} variant="secondary" size="sm">
            <Play className="w-4 h-4 mr-2" />
            Start Timer
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center">
        {/* Timer Ring */}
        <div className="relative">
          <svg className="w-40 h-40 transform -rotate-90">
            {/* Background ring */}
            <circle
              stroke="#e5e7eb"
              fill="none"
              strokeWidth="6"
              r={radius}
              cx="80"
              cy="80"
            />
            {/* Progress ring */}
            <circle
              stroke={getColor(percentage)}
              fill="none"
              strokeWidth="6"
              r={radius}
              cx="80"
              cy="80"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold text-charcoal">{percentage}%</span>
            <span className="text-sm text-gray-500">{formatTime(elapsed)}</span>
          </div>
        </div>

        {/* Task Info */}
        <div className="mt-4 text-center">
          <p className="font-medium text-charcoal">{timeEntry.task_title}</p>
          <p className="text-sm text-gray-500">{timeEntry.project_name}</p>
        </div>

        {/* Controls */}
        <div className="mt-4">
          <Button
            onClick={() => onStop?.(timeEntry.id)}
            variant="secondary"
          >
            <Pause className="w-4 h-4 mr-2" />
            Stop Timer
          </Button>
        </div>
      </div>
    </Card>
  );
}
