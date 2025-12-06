import { Calendar, Clock, AlertTriangle, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '../ui';
import { MilestoneCalendar, MilestoneTimeline } from './MilestoneCalendar';
import { formatDate, daysBetween, daysUntil } from '../../lib/dashboardHelpers';

/**
 * ScheduleSnapshot - Timeline view + upcoming milestones
 */
export function ScheduleSnapshot({ schedule }) {
  const {
    projectStart,
    targetCompletion,
    currentCompletion,
    slippageDays,
    currentPhase,
    phases,
    upcomingMilestones,
  } = schedule;

  const daysToTarget = daysUntil(targetCompletion);
  const daysToProjected = daysUntil(currentCompletion);

  // Calculate overall progress
  const totalDays = daysBetween(projectStart, targetCompletion);
  const elapsedDays = daysBetween(projectStart, new Date());
  const timeProgress = totalDays > 0 ? Math.min((elapsedDays / totalDays) * 100, 100) : 0;

  // Completed phases
  const completedPhases = phases.filter(p => p.status === 'complete').length;
  const workProgress = phases.length > 0 ? (completedPhases / phases.length) * 100 : 0;

  return (
    <Card className="p-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-charcoal flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          Schedule
        </h3>
        <span className="text-sm text-gray-500">{currentPhase}</span>
      </div>

      {/* Completion Dates */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <Target className="w-3 h-3" />
            Target
          </div>
          <p className="font-medium text-charcoal">{formatDate(targetCompletion, 'long')}</p>
          <p className="text-xs text-gray-500">{daysToTarget}d remaining</p>
        </div>
        <div className={`
          p-2 rounded-lg
          ${slippageDays > 7
            ? 'bg-red-50'
            : slippageDays > 0
              ? 'bg-amber-50'
              : 'bg-emerald-50'
          }
        `}>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <Clock className="w-3 h-3" />
            Projected
          </div>
          <p className="font-medium text-charcoal">{formatDate(currentCompletion, 'long')}</p>
          {slippageDays !== 0 && (
            <p className={`text-xs font-medium flex items-center gap-1 ${slippageDays > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {slippageDays > 0 ? (
                <>
                  <TrendingDown className="w-3 h-3" />
                  {slippageDays}d behind
                </>
              ) : (
                <>
                  <TrendingUp className="w-3 h-3" />
                  {Math.abs(slippageDays)}d ahead
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Slippage Warning */}
      {slippageDays >= 7 && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg mb-4 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Schedule is {slippageDays} days behind target</span>
        </div>
      )}

      {/* Phase Timeline */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Phases</h4>
        <div className="space-y-1">
          {phases.map((phase, index) => (
            <PhaseBar key={index} phase={phase} />
          ))}
        </div>
      </div>

      {/* Milestone Timeline */}
      {upcomingMilestones.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Next 2 Weeks</h4>
          <MilestoneTimeline milestones={upcomingMilestones} weeks={2} />
        </div>
      )}

      {/* Upcoming Milestones List */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Upcoming</h4>
        <MilestoneCalendar milestones={upcomingMilestones} maxItems={4} />
      </div>
    </Card>
  );
}

/**
 * PhaseBar - Single phase in timeline
 */
function PhaseBar({ phase }) {
  const statusConfig = {
    complete: { bg: 'bg-emerald-500', text: 'text-emerald-700' },
    in_progress: { bg: 'bg-blue-500', text: 'text-blue-700' },
    upcoming: { bg: 'bg-gray-200', text: 'text-gray-500' },
    delayed: { bg: 'bg-red-500', text: 'text-red-700' },
  };

  const config = statusConfig[phase.status] || statusConfig.upcoming;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.bg}`} />
      <span className={`text-xs flex-1 truncate ${config.text}`}>{phase.name}</span>
      {phase.status === 'in_progress' && (
        <span className="text-xs text-blue-600 font-medium">{phase.percentComplete}%</span>
      )}
      {phase.status === 'complete' && (
        <span className="text-xs text-emerald-600">Done</span>
      )}
    </div>
  );
}

/**
 * ScheduleSummaryCard - Compact schedule display
 */
export function ScheduleSummaryCard({ schedule }) {
  const daysRemaining = daysUntil(schedule.targetCompletion);
  const isDelayed = schedule.slippageDays > 0;

  return (
    <div className="p-3 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">Target Completion</span>
        {isDelayed && (
          <span className="text-xs text-red-600 font-medium">
            {schedule.slippageDays}d behind
          </span>
        )}
      </div>
      <p className="font-medium text-charcoal">{formatDate(schedule.targetCompletion)}</p>
      <p className="text-xs text-gray-500 mt-1">
        {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Target passed'}
      </p>
    </div>
  );
}
