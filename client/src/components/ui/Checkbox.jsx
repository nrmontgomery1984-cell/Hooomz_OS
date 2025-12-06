import { Check } from 'lucide-react';

export function Checkbox({ checked, onChange, label, className = '' }) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer group ${className}`}>
      <div
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange?.(!checked)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onChange?.(!checked);
          }
        }}
        className={`
          w-[18px] h-[18px] rounded border-[1.5px] flex items-center justify-center
          transition-all
          ${checked
            ? 'bg-charcoal border-charcoal'
            : 'border-gray-300 group-hover:border-gray-400'
          }
        `}
      >
        {checked && (
          <Check className="w-3 h-3 text-white" strokeWidth={2} />
        )}
      </div>
      {label && (
        <span className={`text-sm ${checked ? 'text-gray-400 line-through' : 'text-charcoal'}`}>
          {label}
        </span>
      )}
    </label>
  );
}
