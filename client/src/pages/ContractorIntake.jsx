import { useNavigate } from 'react-router-dom';
import { ContractorIntakeWizard } from '../components/contractor-intake';
import { generateProjectFromContractorIntake } from '../services/contractorIntakeService';

/**
 * Contractor Intake Page
 *
 * Entry point for contractors to create projects with scope-of-work.
 * More efficient than homeowner intake - focused on trades and quantities.
 */
export function ContractorIntake() {
  const navigate = useNavigate();

  const handleComplete = async (formData) => {
    try {
      const result = await generateProjectFromContractorIntake(formData);

      if (result.error) {
        console.error('Failed to create project:', result.error);
        // TODO: Show error toast
        return;
      }

      // Navigate to the new project
      navigate(`/projects/${result.data.id}`);
    } catch (err) {
      console.error('Contractor intake submission error:', err);
    }
  };

  const handleCancel = () => {
    // Go back or to dashboard
    navigate(-1);
  };

  return (
    <ContractorIntakeWizard
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
}
