import { Building2, User, Layers, Ruler } from 'lucide-react';
import { Card, Input, Select, Checkbox, AddressInput } from '../../ui';
import { PROJECT_TYPES, SPEC_LEVELS, STOREY_OPTIONS, CEILING_HEIGHT_OPTIONS } from '../../../data/contractorIntakeSchema';

/**
 * Project Info Step - Basic project details and optional client info
 */
export function ProjectInfoStep({ data, errors, onChange }) {
  const { project, client, building } = data;

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

      {/* Building Configuration */}
      <Card className="p-4">
        <h3 className="font-medium text-charcoal mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-400" />
          Building Configuration
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Used to calculate project levels and wall square footage
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Storeys"
              value={building?.storeys || '1'}
              onChange={(value) => onChange('building', { storeys: value })}
              options={STOREY_OPTIONS.map(s => ({ value: s.value, label: s.label }))}
            />

            <Checkbox
              label="Has Basement"
              checked={building?.hasBasement || false}
              onChange={(checked) => onChange('building', { hasBasement: checked })}
            />
          </div>

          {/* Per-level ceiling heights */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Ruler className="w-3 h-3" />
              Ceiling Heights by Level
            </label>
            <div className="space-y-2">
              {/* Basement - only show if hasBasement */}
              {building?.hasBasement && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">Basement</span>
                  <div className="flex gap-1">
                    {CEILING_HEIGHT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange('building', {
                          ceilingHeights: { ...building?.ceilingHeights, basement: opt.value }
                        })}
                        className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
                          (building?.ceilingHeights?.basement || 8) === opt.value
                            ? 'bg-charcoal text-white border-charcoal'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-charcoal'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Floor - always shown */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-24">Main Floor</span>
                <div className="flex gap-1">
                  {CEILING_HEIGHT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onChange('building', {
                        ceilingHeights: { ...building?.ceilingHeights, main: opt.value }
                      })}
                      className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
                        (building?.ceilingHeights?.main || 9) === opt.value
                          ? 'bg-charcoal text-white border-charcoal'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-charcoal'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2nd Floor - show if 1.5+ storeys */}
              {parseFloat(building?.storeys || '1') >= 1.5 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">2nd Floor</span>
                  <div className="flex gap-1">
                    {CEILING_HEIGHT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange('building', {
                          ceilingHeights: { ...building?.ceilingHeights, second: opt.value }
                        })}
                        className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
                          (building?.ceilingHeights?.second || 8) === opt.value
                            ? 'bg-charcoal text-white border-charcoal'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-charcoal'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3rd Floor - show if 3 storeys */}
              {parseFloat(building?.storeys || '1') >= 3 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">3rd Floor</span>
                  <div className="flex gap-1">
                    {CEILING_HEIGHT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange('building', {
                          ceilingHeights: { ...building?.ceilingHeights, third: opt.value }
                        })}
                        className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
                          (building?.ceilingHeights?.third || 8) === opt.value
                            ? 'bg-charcoal text-white border-charcoal'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-charcoal'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
