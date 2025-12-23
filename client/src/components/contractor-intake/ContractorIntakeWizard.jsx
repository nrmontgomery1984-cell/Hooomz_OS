import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, FileText } from 'lucide-react';
import { Button, ProgressBar } from '../ui';
import {
  CONTRACTOR_INTAKE_STEPS,
  getDefaultContractorIntakeState,
  validateContractorIntakeStep,
  getTotalScopeItemCount,
} from '../../data/contractorIntakeSchema';

// Step components
import { ProjectInfoStep } from './steps/ProjectInfoStep';
import { ScopeStep } from './steps/ScopeStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { ReviewStep } from './steps/ReviewStep';

/**
 * Contractor Intake Wizard - Streamlined scope-of-work entry
 *
 * Designed for contractors to quickly enter project details and scope.
 * More efficient than homeowner wizard - focused on trades and quantities.
 */
export function ContractorIntakeWizard({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(getDefaultContractorIntakeState());
  const [errors, setErrors] = useState({});

  const steps = CONTRACTOR_INTAKE_STEPS;
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;
  const currentStepDef = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Update form data by section
  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof data === 'function'
        ? data(prev[section])
        : { ...prev[section], ...data },
    }));
    // Clear errors when data changes
    setErrors({});
  };

  // Direct update for nested data (like scope)
  const setFormDataDirect = (updater) => {
    setFormData(prev => updater(prev));
    setErrors({});
  };

  const handleNext = () => {
    // Validate current step
    const { isValid, errors: stepErrors } = validateContractorIntakeStep(
      currentStepDef.id,
      formData
    );

    if (!isValid) {
      setErrors(stepErrors);
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    // Final validation
    const { isValid, errors: stepErrors } = validateContractorIntakeStep(
      'scope',
      formData
    );
    console.log('Validation result:', { isValid, stepErrors });

    if (!isValid) {
      setErrors(stepErrors);
      console.log('Validation failed, not submitting');
      return;
    }

    if (onComplete) {
      console.log('Calling onComplete with formData');
      await onComplete(formData);
    }
  };

  // Render the current step component
  const renderStep = () => {
    switch (currentStepDef.id) {
      case 'project':
        return (
          <ProjectInfoStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        );
      case 'scope':
        return (
          <ScopeStep
            data={formData}
            errors={errors}
            onChange={setFormDataDirect}
          />
        );
      case 'schedule':
        return (
          <ScheduleStep
            data={formData.schedule}
            errors={errors}
            onChange={(data) => updateFormData('schedule', data)}
          />
        );
      case 'review':
        return (
          <ReviewStep
            data={formData}
            onEditStep={setCurrentStep}
          />
        );
      default:
        return (
          <div className="text-center py-12 text-gray-500">
            Step "{currentStepDef.id}" not implemented
          </div>
        );
    }
  };

  // Scope item count for header
  const scopeItemCount = getTotalScopeItemCount(formData.scope);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={currentStep === 0 ? onCancel : handleBack}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-charcoal"
            >
              <ChevronLeft className="w-4 h-4" />
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </button>
            <div className="flex items-center gap-3">
              {scopeItemCount > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {scopeItemCount} scope items
                </span>
              )}
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
          </div>
          <ProgressBar value={progress} color="blue" height="slim" />
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Step Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-charcoal">
              {currentStepDef.title}
            </h2>
          </div>
          <p className="text-sm text-gray-600">{currentStepDef.description}</p>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

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
              Create Project
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
