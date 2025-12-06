export function ProgressBar({ value, color = 'green', height = 'thin', className = '' }) {
  const colors = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
  };

  const heights = {
    thin: 'h-0.5',
    normal: 'h-1',
    thick: 'h-1.5',
  };

  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${heights[height]} ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${colors[color]}`}
        style={{ width: `${safeValue}%` }}
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
