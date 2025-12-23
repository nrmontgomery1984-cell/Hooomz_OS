import { useNavigate } from 'react-router-dom';
import { ContractorIntakeWizard } from '../components/contractor-intake';
import { generateProjectFromContractorIntake } from '../services/contractorIntakeService';
import { useToast } from '../components/ui';

/**
 * Contractor Intake Page
 *
 * Entry point for contractors to create projects with scope-of-work.
 * More efficient than homeowner intake - focused on trades and quantities.
 */
export function ContractorIntake() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleComplete = async (formData) => {
    try {
      console.log('Creating project with data:', formData);
      const result = await generateProjectFromContractorIntake(formData);
      console.log('Create project result:', result);

      if (result.error) {
        console.error('Create project error:', result.error);
        showToast(`Failed to create project: ${result.error}`, 'error');
        return;
      }

      // Navigate to the new project
      navigate(`/projects/${result.data.id}`);
    } catch (err) {
      console.error('Create project exception:', err);
      showToast('Failed to create project. Please try again.', 'error');
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
