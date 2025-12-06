import { PROJECT_PHASES } from '../../types/dashboard';

/**
 * Health-based colors for phases
 * - on_track (green): Meeting deadlines
 * - at_risk (yellow): May miss deadlines
 * - behind (red): Missing deadlines
 */
const HEALTH_COLORS = {
  on_track: {
    solid: 'bg-emerald-500',
    half: 'bg-emerald-200',
    text: 'text-emerald-600',
    line: 'bg-emerald-300'
  },
  at_risk: {
    solid: 'bg-amber-500',
    half: 'bg-amber-200',
    text: 'text-amber-600',
    line: 'bg-amber-300'
  },
  behind: {
    solid: 'bg-red-500',
    half: 'bg-red-200',
    text: 'text-red-600',
    line: 'bg-red-300'
  },
};

/**
 * PhaseIndicator - Horizontal stepper showing project phases
 *
 * @param {string} currentPhase - Current phase ID
 * @param {string} healthStatus - Timeline health: 'on_track' | 'at_risk' | 'behind'
 * @param {boolean} compact - Show compact version
 */
export function PhaseIndicator({ currentPhase, healthStatus = 'on_track', compact = false }) {
  const currentIndex = PROJECT_PHASES.findIndex(p => p.id === currentPhase);

  // Get color for current phase based on health
  const currentHealthColor = HEALTH_COLORS[healthStatus] || HEALTH_COLORS.on_track;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {PROJECT_PHASES.map((phase, index) => {
          return (
            <div
              key={phase.id}
              className={`
                h-1.5 rounded-full transition-all
                ${index < currentIndex
                  ? 'w-3 bg-emerald-200'
                  : index === currentIndex
                    ? `w-6 ${currentHealthColor.solid}`
                    : 'w-3 bg-gray-200'
                }
              `}
              title={phase.label}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center w-full">
      {PROJECT_PHASES.map((phase, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={phase.id} className="flex items-center flex-1 last:flex-none">
            {/* Phase node */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center transition-colors
                  ${isCompleted
                    ? 'bg-emerald-200 text-emerald-700'
                    : isCurrent
                      ? `${currentHealthColor.solid} text-white`
                      : 'bg-gray-100 text-gray-400'
                  }
                `}
              >
                <span className="text-xs font-semibold">{index + 1}</span>
              </div>
              <span
                className={`
                  text-xs mt-1 whitespace-nowrap
                  ${isCurrent
                    ? `${currentHealthColor.text} font-medium`
                    : isCompleted
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                  }
                `}
              >
                {phase.label}
              </span>
            </div>

            {/* Connector line */}
            {index < PROJECT_PHASES.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-2 transition-colors
                  ${isCompleted ? 'bg-emerald-300' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * PhaseChip - Single phase badge
 */
export function PhaseChip({ phase }) {
  const phaseConfig = {
    intake: { bg: 'bg-purple-100', text: 'text-purple-700' },
    estimating: { bg: 'bg-blue-100', text: 'text-blue-700' },
    estimate: { bg: 'bg-blue-100', text: 'text-blue-700' },
    quoted: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
    contracted: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    contract: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    active: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    punch_list: { bg: 'bg-amber-100', text: 'text-amber-700' },
    complete: { bg: 'bg-gray-100', text: 'text-gray-700' },
  };

  const config = phaseConfig[phase] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  const phaseData = PROJECT_PHASES.find(p => p.id === phase);
  const label = phaseData?.label || phase.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {label}
    </span>
  );
}
