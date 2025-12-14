import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { UserPlus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts';
import { Card, Button } from '../../components/ui';

export function AcceptInvite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { acceptInvite, user, isAuthenticated, organization } = useAuth();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link');
      setLoading(false);
      return;
    }

    // If not authenticated, redirect to signup with return URL
    if (!isAuthenticated) {
      navigate(`/signup?redirect=/accept-invite?token=${token}`);
      return;
    }

    // If user already has an organization, show error
    if (organization) {
      setError('You are already a member of an organization');
      setLoading(false);
      return;
    }

    // Accept the invite
    handleAcceptInvite();
  }, [token, isAuthenticated, organization]);

  const handleAcceptInvite = async () => {
    setLoading(true);
    const { success, error } = await acceptInvite(token);

    if (success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setError(error?.message || 'This invite link is invalid or has expired');
    }

    setLoading(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="py-8 px-4 sm:px-10">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
              <h2 className="mt-4 text-lg font-medium text-charcoal">
                Processing Invite
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Please wait...
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="py-8 px-4 sm:px-10">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-4 text-lg font-medium text-charcoal">
                Welcome to the team!
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                You've successfully joined the organization.
                Taking you to your dashboard...
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 sm:px-10">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-lg font-medium text-charcoal">
              Unable to Accept Invite
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>
            <div className="mt-6 space-y-3">
              {organization ? (
                <Link to="/">
                  <Button className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/onboarding">
                  <Button className="w-full">
                    <UserPlus className="mr-2 w-4 h-4" />
                    Create Your Own Organization
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
