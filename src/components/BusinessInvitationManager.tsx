import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, 
  Mail, 
  Building2, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  Send,
  Copy,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useBusinessManagement } from '@/contexts/BusinessManagementContext';

interface BusinessInvitation {
  id: string;
  business_id: string;
  invited_by: string;
  invited_email: string;
  invited_name?: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitation_token?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  email?: string;
  token?: string;
  permissions: any;
  business: {
    name: string;
  };
}

interface BusinessAccess {
  id: string;
  business_id: string;
  user_id: string;
  access_level: string;
  role?: string;
  is_active: boolean;
  granted_at: string;
  invitation_id?: string;
  granted_by: string;
  expires_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface PageTemplate {
  id: string;
  template_name: string;
  profession_type: string;
  description: string;
  pages: any[];
}

const BusinessInvitationManager: React.FC = () => {
  const { currentBusiness } = useBusinessManagement();
  const [invitations, setInvitations] = useState<BusinessInvitation[]>([]);
  const [accessList, setAccessList] = useState<BusinessAccess[]>([]);
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  
  // Invitation form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState('limited');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadInvitations(),
        loadAccessList(),
        loadTemplates()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('business_invitations')
      .select(`
        *,
        business:businesses(name)
      `)
      .eq('invited_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading invitations:', error);
      return;
    }

    setInvitations(data || []);
  };

  const loadAccessList = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // For now, use business_memberships to show access
    const { data, error } = await supabase
      .from('business_memberships')
      .select(`
        *,
        business:businesses(name)
      `)
      .eq('invited_by', user.id)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error loading access list:', error);
      return;
    }

    // Transform business_memberships data to match BusinessAccess interface
    const accessData = (data || []).map(membership => ({
      id: membership.id,
      business_id: membership.business_id,
      user_id: membership.user_id,
      access_level: 'standard', // Default access level
      role: membership.role,
      is_active: membership.status === 'active',
      granted_at: membership.joined_at,
      granted_by: membership.invited_by || user.id,
      created_at: membership.created_at,
      updated_at: membership.updated_at
    }));

    setAccessList(accessData);
  };

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('business_page_templates')
      .select('*')
      .order('template_name');

    if (error) {
      console.error('Error loading templates:', error);
      return;
    }

    setTemplates(data || []);
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail || !selectedTemplate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setInviteLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      // Use current business from context
      if (!currentBusiness?.id) {
        toast.error('No business selected. Please wait for businesses to load or select a business first.');
        console.log('Current business state:', currentBusiness);
        return;
      }

      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id, user_type, full_name')
        .eq('email', inviteEmail)
        .single();

      if (userError || !userData) {
        toast.error('User not found. Please ask them to sign up first.');
        return;
      }

      if (userData.user_type !== 'individual') {
        toast.error('User is not an individual account');
        return;
      }

      // Create invitation
      const { data: invitationData, error: invitationError } = await supabase
        .from('business_invitations')
        .insert({
          business_id: currentBusiness.id,
          invited_by: user.id,
          invited_email: inviteEmail,
          invited_name: userData.full_name || null,
          role: 'manager', // Default role
          status: 'pending',
          invitation_token: crypto.randomUUID(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          permissions: {}
        })
        .select()
        .single();

      if (invitationError) {
        console.error('Error creating invitation:', invitationError);
        toast.error('Failed to send invitation');
        return;
      }

      // Create business membership for the invited user
      const { data: membershipData, error: membershipError } = await supabase
        .from('business_memberships')
        .insert({
          business_id: currentBusiness.id,
          user_id: userData.id,
          role: 'manager', // Default role
          status: 'pending',
          invited_by: user.id,
          invited_at: new Date().toISOString()
        })
        .select()
        .single();

      if (membershipError) {
        console.error('Error creating membership:', membershipError);
        toast.error('Failed to create business membership');
        return;
      }

      toast.success('Invitation sent successfully!');
      setInviteEmail('');
      setInviteMessage('');
      setSelectedTemplate('');
      loadData();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/accept-invitation/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Invitation link copied to clipboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'declined':
        return <XCircle className="h-3 w-3" />;
      case 'expired':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#040458]">Business Access Management</h2>
          <p className="text-gray-600">Invite individual users and manage their access to your business</p>
        </div>
      </div>

      <Tabs defaultValue="invite" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invite">Send Invitation</TabsTrigger>
          <TabsTrigger value="manage">Manage Access</TabsTrigger>
        </TabsList>

        <TabsContent value="invite" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Invite Individual User to Business</span>
              </CardTitle>
              <CardDescription>
                Send an invitation to an individual user to join your business. They will receive a notification in their dashboard to accept or decline the invitation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendInvitation} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select value={selectedAccessLevel} onValueChange={setSelectedAccessLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member - Basic access to business features</SelectItem>
                        <SelectItem value="manager">Manager - Can manage inventory and reports</SelectItem>
                        <SelectItem value="admin">Admin - Full access except business settings</SelectItem>
                        <SelectItem value="owner">Owner - Complete business control</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Permission Template *</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select permission template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.template_name} - {template.profession_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Add a personal message to explain why you're inviting them..."
                    rows={3}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">What happens next?</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        The individual will receive an email notification and see this invitation in their dashboard. 
                        They can accept or decline the invitation, and you'll be notified of their decision.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={inviteLoading}
                  className="w-full bg-[#faa51a] hover:bg-[#040458] text-white"
                >
                  {inviteLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending Invitation...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="h-4 w-4" />
                      <span>Send Business Invitation</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Active Access ({accessList.length})</span>
                </CardTitle>
                <CardDescription>
                  Users who currently have access to your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accessList.map((access) => (
                    <div key={access.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#040458]/10 rounded-full">
                          <Building2 className="h-4 w-4 text-[#040458]" />
                        </div>
                        <div>
                          <p className="font-medium">User ID: {access.user_id}</p>
                          <p className="text-sm text-gray-600">Role: {access.role || 'manager'}</p>
                          <p className="text-xs text-gray-500">
                            Joined: {new Date(access.granted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {access.role || 'manager'}
                        </Badge>
                        <Badge className={access.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {access.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Invitations ({invitations.length})</span>
                </CardTitle>
                <CardDescription>
                  Pending and recent invitations sent to individual users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#faa51a]/10 rounded-full">
                          <Mail className="h-4 w-4 text-[#faa51a]" />
                        </div>
                        <div>
                          <p className="font-medium">{invitation.invited_name || invitation.invited_email}</p>
                          <p className="text-sm text-gray-600">{invitation.invited_email}</p>
                          <p className="text-xs text-gray-500">
                            Role: {invitation.role} • Sent: {new Date(invitation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(invitation.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(invitation.status)}
                            <span className="capitalize">{invitation.status}</span>
                          </div>
                        </Badge>
                        {invitation.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyInvitationLink(invitation.invitation_token)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy Link
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessInvitationManager;
