export function StatusDot({ status = 'gray', size = 'sm' }) {
  const colors = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
    gray: 'bg-gray-400',
  };

  const sizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={`rounded-full ${colors[status]} ${sizes[size]}`}
      aria-label={`Status: ${status}`}
    />
  );
}

export function getHealthColor(score) {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
}
