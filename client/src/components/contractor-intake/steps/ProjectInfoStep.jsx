import { Building2, User } from 'lucide-react';
import { Card, Input, Select, Checkbox, AddressInput } from '../../ui';
import { PROJECT_TYPES, SPEC_LEVELS } from '../../../data/contractorIntakeSchema';

/**
 * Project Info Step - Basic project details and optional client info
 */
export function ProjectInfoStep({ data, errors, onChange }) {
  const { project, client } = data;

  const projectTypeOptions = PROJECT_TYPES.map(t => ({
    value: t.value,
    label: t.label,
  }));

  const specLevelOptions = SPEC_LEVELS.map(s => ({
    value: s.value,
    label: `${s.label} - ${s.description}`,
  }));

  return (
    <div className="space-y-6">
      {/* Project Details */}
      <Card className="p-4">
        <h3 className="font-medium text-charcoal mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          Project Details
        </h3>

        <div className="space-y-4">
          <Input
            label="Project Name"
            value={project.name}
            onChange={(e) => onChange('project', { name: e.target.value })}
            placeholder="e.g., Johnson Kitchen Remodel"
            error={errors.name}
            required
          />

          <AddressInput
            label="Project Address"
            value={project.address}
            onChange={(address) => onChange('project', { address })}
            onPlaceSelect={(placeData) => onChange('project', { placeData })}
            placeData={project.placeData}
            placeholder="Start typing an address..."
            error={errors.address}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Project Type"
              value={project.projectType}
              onChange={(value) => onChange('project', { projectType: value })}
              options={projectTypeOptions}
            />

            <Select
              label="Spec Level"
              value={project.specLevel}
              onChange={(value) => onChange('project', { specLevel: value })}
              options={specLevelOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Notes (optional)
            </label>
            <textarea
              value={project.notes}
              onChange={(e) => onChange('project', { notes: e.target.value })}
              placeholder="Any additional notes about the project..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Client Info (Optional) */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-charcoal flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            Client Information
          </h3>
          <Checkbox
            label="This project has a client"
            checked={client.hasClient}
            onChange={(checked) => onChange('client', { hasClient: checked })}
          />
        </div>

        {client.hasClient && (
          <div className="space-y-4">
            <Input
              label="Client Name"
              value={client.name}
              onChange={(e) => onChange('client', { name: e.target.value })}
              placeholder="John & Jane Doe"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={client.email}
                onChange={(e) => onChange('client', { email: e.target.value })}
                placeholder="client@email.com"
              />

              <Input
                label="Phone"
                type="tel"
                value={client.phone}
                onChange={(e) => onChange('client', { phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        )}

        {!client.hasClient && (
          <p className="text-sm text-gray-500">
            Enable this if you're creating a project on behalf of a homeowner client.
          </p>
        )}
      </Card>
    </div>
  );
}
