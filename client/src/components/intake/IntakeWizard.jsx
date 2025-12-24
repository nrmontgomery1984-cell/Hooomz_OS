import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Home, Hammer } from 'lucide-react';
import { Card, Button, ProgressBar } from '../ui';
import {
  NEW_CONSTRUCTION_STEPS,
  RENOVATION_STEPS,
  getDefaultIntakeState,
} from '../../data/intakeSchema';
import { calculateEstimate } from '../../data/intakeTemplates';

// Step components
import { ContactStep } from './steps/ContactStep';
import { ProjectStep } from './steps/ProjectStep';
import { ScopeStep } from './steps/ScopeStep';
import { RoomTiersStep } from './steps/RoomTiersStep';
import { SelectionsStep } from './steps/SelectionsStep';
import { NotesStep } from './steps/NotesStep';
import { SiteStep } from './steps/SiteStep';
import { LayoutStep } from './steps/LayoutStep';
import { ConditionsStep } from './steps/ConditionsStep';
import { SystemsStep } from './steps/SystemsStep';
import { LogisticsStep } from './steps/LogisticsStep';

/**
 * IntakeWizard - Multi-step customer intake form
 *
 * Generates a Project with Loops and Tasks based on selections.
 */
export function IntakeWizard({ initialType = null, onComplete }) {
  const [formType, setFormType] = useState(initialType); // null = show picker
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(null);
  const [estimate, setEstimate] = useState(null);

  // Initialize form data when type is selected
  useEffect(() => {
    if (formType) {
      setFormData(getDefaultIntakeState(formType));
    }
  }, [formType]);

  // Recalculate estimate when relevant data changes
  useEffect(() => {
    if (formData && formType === 'renovation') {
      setEstimate(calculateEstimate(formData));
    }
  }, [formData?.renovation?.room_tiers, formData?.project?.build_tier]);

  const steps = formType === 'new_construction' ? NEW_CONSTRUCTION_STEPS : RENOVATION_STEPS;
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    console.log('[IntakeWizard] handleSubmit called');
    console.log('[IntakeWizard] formData:', formData);
    console.log('[IntakeWizard] onComplete exists:', !!onComplete);

    // This will generate the project, loops, and tasks
    if (onComplete) {
      try {
        await onComplete(formData, estimate);
      } catch (err) {
        console.error('[IntakeWizard] onComplete error:', err);
      }
    } else {
      console.error('[IntakeWizard] No onComplete handler!');
    }
  };

  // Type picker screen
  if (!formType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-charcoal mb-2">
              Welcome to Henderson Contracting
            </h1>
            <p className="text-gray-600">
              Let's start planning your project. What type of work are you considering?
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setFormType('new_construction')}
              className="w-full p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-1">
                    New Home Construction
                  </h3>
                  <p className="text-sm text-gray-600">
                    Building a new home from the ground up. Includes site prep, foundation, framing, and all finishes.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setFormType('renovation')}
              className="w-full p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                  <Hammer className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-1">
                    Major Renovation
                  </h3>
                  <p className="text-sm text-gray-600">
                    Renovating an existing home. From single room updates to whole-house transformations.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!formData) return null;

  const currentStepDef = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Render the current step component
  const renderStep = () => {
    switch (currentStepDef.id) {
      case 'contact':
        return (
          <ContactStep
            data={formData.contact}
            onChange={(data) => updateFormData('contact', data)}
          />
        );
      case 'project':
      case 'property':
        return (
          <ProjectStep
            data={formData.project}
            formType={formType}
            onChange={(data) => updateFormData('project', data)}
          />
        );
      case 'scope':
        return (
          <ScopeStep
            data={formData.renovation}
            onChange={(data) => updateFormData('renovation', data)}
          />
        );
      case 'room_tiers':
        return (
          <RoomTiersStep
            data={formData.renovation}
            buildTier={formData.project?.build_tier}
            onChange={(data) => updateFormData('renovation', data)}
            estimate={estimate}
          />
        );
      case 'selections':
      case 'exterior':
      case 'interior':
      case 'kitchen':
      case 'bathrooms':
      case 'mechanical':
        return (
          <SelectionsStep
            stepId={currentStepDef.id}
            data={formData.selections}
            formType={formType}
            buildTier={formData.project?.build_tier}
            onChange={(data) => updateFormData('selections', data)}
          />
        );
      case 'notes':
        return (
          <NotesStep
            data={formData.notes}
            formType={formType}
            onChange={(data) => updateFormData('notes', data)}
          />
        );
      case 'site':
        return (
          <SiteStep
            data={formData.site}
            onChange={(data) => updateFormData('site', data)}
          />
        );
      case 'layout':
        return (
          <LayoutStep
            data={formData.layout}
            onChange={(data) => updateFormData('layout', data)}
          />
        );
      case 'conditions':
        return (
          <ConditionsStep
            data={formData.renovation}
            onChange={(data) => updateFormData('renovation', data)}
          />
        );
      case 'systems':
        return (
          <SystemsStep
            data={formData.renovation}
            onChange={(data) => updateFormData('renovation', data)}
          />
        );
      case 'logistics':
        return (
          <LogisticsStep
            data={formData.renovation}
            onChange={(data) => updateFormData('renovation', data)}
          />
        );
      case 'features':
        // Features step - placeholder for now, uses selections pattern
        return (
          <SelectionsStep
            stepId="features"
            data={formData.selections}
            formType={formType}
            buildTier={formData.project?.build_tier}
            onChange={(data) => updateFormData('selections', data)}
          />
        );
      default:
        return (
          <div className="text-center py-12 text-gray-500">
            Step "{currentStepDef.id}" coming soon...
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => {
                if (currentStep === 0) {
                  setFormType(null);
                } else {
                  handleBack();
                }
              }}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-charcoal"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <ProgressBar value={progress} color="blue" height="slim" />
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Step Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-charcoal">
            {currentStepDef.title}
          </h2>
          <p className="text-sm text-gray-600">{currentStepDef.description}</p>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Estimate Display (for renovation) */}
        {formType === 'renovation' && estimate && estimate.low > 0 && (
          <Card className="p-4 mb-6 bg-blue-50 border-blue-100">
            <p className="text-sm text-gray-600 mb-1">Estimated Range</p>
            <p className="text-xl font-semibold text-blue-700">
              ${estimate.low.toLocaleString()} - ${estimate.high.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Based on {estimate.buildTier} tier selections. Final pricing after site visit.
            </p>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button variant="secondary" onClick={handleBack} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
          )}
          {isLastStep ? (
            <Button onClick={handleSubmit} className="flex-1">
              <Check className="w-4 h-4 mr-1" />
              Submit Intake
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
