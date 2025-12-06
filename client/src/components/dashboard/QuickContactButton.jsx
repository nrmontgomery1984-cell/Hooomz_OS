import { Phone, Mail, MessageSquare } from 'lucide-react';

/**
 * QuickContactButton - Click-to-contact buttons
 */
export function QuickContactButton({ type, value, size = 'md', variant = 'default' }) {
  const config = {
    phone: {
      icon: Phone,
      href: `tel:${value}`,
      label: 'Call',
      color: 'text-blue-600 hover:bg-blue-50',
    },
    email: {
      icon: Mail,
      href: `mailto:${value}`,
      label: 'Email',
      color: 'text-emerald-600 hover:bg-emerald-50',
    },
    text: {
      icon: MessageSquare,
      href: `sms:${value}`,
      label: 'Text',
      color: 'text-purple-600 hover:bg-purple-50',
    },
  };

  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const { icon: Icon, href, label, color } = config[type];

  if (variant === 'labeled') {
    return (
      <a
        href={href}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
          border border-gray-200 transition-colors ${color}
        `}
        title={`${label} ${value}`}
      >
        <Icon className={iconSizes[size]} />
        <span>{label}</span>
      </a>
    );
  }

  return (
    <a
      href={href}
      className={`
        inline-flex items-center justify-center rounded-lg
        border border-gray-200 transition-colors ${sizes[size]} ${color}
      `}
      title={`${label} ${value}`}
    >
      <Icon className={iconSizes[size]} />
    </a>
  );
}

/**
 * ContactButtons - Group of contact buttons
 */
export function ContactButtons({ phone, email, preferred, size = 'md' }) {
  // Order based on preferred contact
  const buttons = [];

  if (preferred === 'text' && phone) {
    buttons.push({ type: 'text', value: phone });
  }

  if (phone) {
    buttons.push({ type: 'phone', value: phone });
    if (preferred !== 'text') {
      buttons.push({ type: 'text', value: phone });
    }
  }

  if (email) {
    buttons.push({ type: 'email', value: email });
  }

  // Remove duplicate text if phone was already added
  const uniqueButtons = buttons.filter(
    (btn, index, self) =>
      index === self.findIndex(b => b.type === btn.type)
  );

  // Move preferred to front
  const sorted = uniqueButtons.sort((a, b) => {
    if (a.type === preferred) return -1;
    if (b.type === preferred) return 1;
    return 0;
  });

  return (
    <div className="flex items-center gap-1">
      {sorted.map((btn) => (
        <QuickContactButton
          key={btn.type}
          type={btn.type}
          value={btn.value}
          size={size}
        />
      ))}
    </div>
  );
}

/**
 * PreferredContactBadge - Shows preferred contact method
 */
export function PreferredContactBadge({ preferred }) {
  const config = {
    phone: { icon: Phone, label: 'Prefers Call', color: 'text-blue-600 bg-blue-50' },
    email: { icon: Mail, label: 'Prefers Email', color: 'text-emerald-600 bg-emerald-50' },
    text: { icon: MessageSquare, label: 'Prefers Text', color: 'text-purple-600 bg-purple-50' },
  };

  const { icon: Icon, label, color } = config[preferred] || config.email;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
