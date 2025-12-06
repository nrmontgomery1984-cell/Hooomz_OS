import { Input, Select } from '../../ui';
import { CONTACT_METHODS } from '../../../data/intakeSchema';

export function ContactStep({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-4">
      <Input
        label="Full Name"
        placeholder="John & Jane Smith"
        value={data.full_name || ''}
        onChange={(e) => handleChange('full_name', e.target.value)}
        required
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="john@example.com"
        value={data.email || ''}
        onChange={(e) => handleChange('email', e.target.value)}
        required
      />

      <Input
        label="Phone Number"
        type="tel"
        placeholder="(506) 555-1234"
        value={data.phone || ''}
        onChange={(e) => handleChange('phone', e.target.value)}
        required
      />

      <Select
        label="Preferred Contact Method"
        value={data.preferred_contact || 'email'}
        onChange={(value) => handleChange('preferred_contact', value)}
        options={CONTACT_METHODS}
      />

      <Select
        label="Primary Decision-Maker"
        value={data.primary_decision_maker || 'both'}
        onChange={(value) => handleChange('primary_decision_maker', value)}
        options={[
          { value: 'homeowner_1', label: 'Homeowner 1' },
          { value: 'homeowner_2', label: 'Homeowner 2' },
          { value: 'both', label: 'Both Equally' },
          { value: 'other', label: 'Other' },
        ]}
      />
    </div>
  );
}
