import { Check } from 'lucide-react';

export function Checkbox({ checked, onChange, label, className = '' }) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer group ${className}`}>
      {/* Outer touch target wrapper - 44x44px minimum for mobile accessibility */}
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
        className="relative w-11 h-11 flex items-center justify-center -m-3 active:bg-gray-100 rounded-full transition-colors"
      >
        {/* Visual checkbox - smaller for aesthetics */}
        <div
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
      </div>
      {label && (
        <span className={`text-sm ${checked ? 'text-gray-400 line-through' : 'text-charcoal'}`}>
          {label}
        </span>
      )}
    </label>
  );
}
