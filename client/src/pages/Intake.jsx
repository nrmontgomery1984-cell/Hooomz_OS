import { useNavigate } from 'react-router-dom';
import { IntakeWizard } from '../components/intake';
import { generateProjectFromIntake } from '../services/intakeService';

/**
 * Intake Page - Customer intake form entry point
 *
 * Renders the IntakeWizard and handles form submission
 * by generating a Project with Loops and Tasks.
 */
export function Intake() {
  const navigate = useNavigate();

  const handleComplete = async (formData, estimate) => {
    try {
      // Generate Project, Loops, and Tasks from intake data
      const result = await generateProjectFromIntake(formData, estimate);

      if (result.error) {
        console.error('Failed to create project:', result.error);
        // TODO: Show error toast
        return;
      }

      // Navigate to the new project
      navigate(`/projects/${result.data.id}`);
    } catch (err) {
      console.error('Intake submission error:', err);
    }
  };

  return <IntakeWizard onComplete={handleComplete} />;
}
