import { useNavigate } from 'react-router-dom';
import { IntakeWizard } from '../components/intake';
import { generateProjectFromIntake } from '../services/intakeService';
import { useToast } from '../components/ui';

/**
 * Intake Page - Customer intake form entry point
 *
 * Renders the IntakeWizard and handles form submission
 * by generating a Project with Loops and Tasks.
 */
export function Intake() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleComplete = async (formData, estimate) => {
    console.log('[Intake] handleComplete called with:', formData);
    try {
      // Generate Project, Loops, and Tasks from intake data
      const result = await generateProjectFromIntake(formData, estimate);
      console.log('[Intake] generateProjectFromIntake result:', result);

      if (result.error) {
        console.error('[Intake] Error:', result.error);
        showToast(`Failed to create project: ${result.error}`, 'error');
        return;
      }

      // Navigate to the new project
      console.log('[Intake] Navigating to project:', result.data.id);
      navigate(`/projects/${result.data.id}`);
    } catch (err) {
      console.error('[Intake] Exception:', err);
      showToast('Failed to create project. Please try again.', 'error');
    }
  };

  return <IntakeWizard onComplete={handleComplete} />;
}
