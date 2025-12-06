export function Logo({ size = 'default' }) {
  const sizes = {
    small: 'text-lg',
    default: 'text-xl',
    large: 'text-2xl',
  };

  return (
    <span className={`font-bold tracking-tight ${sizes[size]}`}>
      <span className="text-charcoal">H</span>
      <span className="text-red-500">O</span>
      <span className="text-amber-500">O</span>
      <span className="text-emerald-500">O</span>
      <span className="text-charcoal">MZ</span>
    </span>
  );
}
