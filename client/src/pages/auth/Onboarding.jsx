import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Users, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts';
import { Card, Button, Input } from '../../components/ui';

export function Onboarding() {
  const navigate = useNavigate();
  const { createOrganization, profile, error, clearError } = useAuth();

  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Auto-generate slug from name
  const handleNameChange = (name) => {
    setOrgName(name);
    // Create URL-safe slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setOrgSlug(slug);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    if (!orgName.trim()) {
      setValidationError('Organization name is required');
      return;
    }

    if (!orgSlug.trim() || orgSlug.length < 3) {
      setValidationError('Slug must be at least 3 characters');
      return;
    }

    setLoading(true);

    const { error } = await createOrganization({
      name: orgName.trim(),
      slug: orgSlug.trim(),
    });

    setLoading(false);

    if (!error) {
      setStep(2);
      // Redirect after showing success
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  // Success state
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="py-8 px-4 sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-charcoal">
                You're all set!
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                <strong>{orgName}</strong> has been created.
                Taking you to your dashboard...
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-charcoal">Welcome to Hooomz</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let's set up your organization
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 sm:px-10">
          {/* Welcome message */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  Hi {profile?.full_name || 'there'}! Create your organization to get started.
                  You'll be able to invite team members later.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {(error || validationError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error || validationError}</p>
              </div>
            )}

            <div>
              <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">
                Organization name
              </label>
              <div className="mt-1 relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="orgName"
                  type="text"
                  value={orgName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Smith Construction"
                  className="pl-10"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Your company or business name
              </p>
            </div>

            <div>
              <label htmlFor="orgSlug" className="block text-sm font-medium text-gray-700">
                Organization URL
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  hooomz.app/
                </span>
                <Input
                  id="orgSlug"
                  type="text"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="smith-construction"
                  className="rounded-l-none"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                'Creating...'
              ) : (
                <>
                  Create Organization
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
