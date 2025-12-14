import { useState, useEffect } from 'react';
import { Users, Mail, UserPlus, Trash2, Crown, Shield, User, Send, X, Copy, Check } from 'lucide-react';
import { Card, Button, Input } from '../ui';
import { useAuth } from '../../contexts';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

export function TeamSettings() {
  const { profile, organization } = useAuth();
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);

  const isOwnerOrAdmin = profile?.role === 'owner' || profile?.role === 'admin';

  useEffect(() => {
    if (isSupabaseConfigured() && organization) {
      loadTeamData();
    } else {
      setLoading(false);
    }
  }, [organization]);

  const loadTeamData = async () => {
    try {
      // Load team members
      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('is_active', true);

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Load pending invites (only for admins)
      if (isOwnerOrAdmin) {
        const { data: invitesData, error: invitesError } = await supabase
          .from('organization_invites')
          .select('*')
          .eq('organization_id', organization.id)
          .is('accepted_at', null)
          .gt('expires_at', new Date().toISOString());

        if (invitesError) throw invitesError;
        setInvites(invitesData || []);
      }
    } catch (err) {
      console.error('Error loading team:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    setError(null);
    setInviting(true);

    try {
      // Check if email already invited
      const existingInvite = invites.find(i => i.email.toLowerCase() === inviteEmail.toLowerCase());
      if (existingInvite) {
        throw new Error('This email has already been invited');
      }

      // Check if email already a member
      const existingMember = members.find(m => m.email.toLowerCase() === inviteEmail.toLowerCase());
      if (existingMember) {
        throw new Error('This person is already a team member');
      }

      // Create invite
      const { data, error } = await supabase
        .from('organization_invites')
        .insert({
          organization_id: organization.id,
          email: inviteEmail.toLowerCase(),
          role: inviteRole,
          invited_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      setInvites([...invites, data]);
      setInviteEmail('');
      setShowInviteModal(false);

      // TODO: Send email notification (would require edge function or backend)
      // For now, user can copy invite link

    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const cancelInvite = async (inviteId) => {
    try {
      const { error } = await supabase
        .from('organization_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;

      setInvites(invites.filter(i => i.id !== inviteId));
    } catch (err) {
      console.error('Error canceling invite:', err);
    }
  };

  const copyInviteLink = async (token) => {
    const link = `${window.location.origin}/accept-invite?token=${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedLink(token);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-amber-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner': return 'Owner';
      case 'admin': return 'Admin';
      default: return 'Member';
    }
  };

  // Not in Supabase mode
  if (!isSupabaseConfigured()) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-charcoal mb-2">Team Management</h3>
          <p className="text-sm text-gray-500 mb-4">
            Team management requires a Supabase connection.
            Configure your .env file to enable this feature.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-charcoal">Team Members</h3>
            <p className="text-sm text-gray-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {isOwnerOrAdmin && (
          <Button size="sm" onClick={() => setShowInviteModal(true)}>
            <UserPlus className="w-4 h-4 mr-1" />
            Invite
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Team Members */}
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.full_name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {(member.full_name || member.email)[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">
                      {member.full_name || 'No name'}
                      {member.id === profile?.id && (
                        <span className="ml-2 text-xs text-gray-400">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleIcon(member.role)}
                  <span className="text-sm text-gray-600">{getRoleLabel(member.role)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pending Invites */}
          {isOwnerOrAdmin && invites.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Pending Invites</h4>
              <div className="space-y-2">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium text-charcoal">{invite.email}</p>
                        <p className="text-xs text-gray-500">
                          Invited as {getRoleLabel(invite.role)} • Expires {new Date(invite.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyInviteLink(invite.token)}
                        className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                        title="Copy invite link"
                      >
                        {copiedLink === invite.token ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => cancelInvite(invite.id)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Cancel invite"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-md"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <h2 className="text-lg font-semibold text-charcoal mb-2">
              Invite Team Member
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Send an invite to join {organization?.name}
            </p>

            <form onSubmit={sendInvite} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="member">Member - Can view and edit projects</option>
                  <option value="admin">Admin - Can manage team and settings</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={inviting}
                >
                  {inviting ? 'Sending...' : (
                    <>
                      <Send className="w-4 h-4 mr-1" />
                      Send Invite
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Card>
  );
}
