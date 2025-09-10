import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Trash2, 
  AlertTriangle, 
  User, 
  Mail, 
  Calendar,
  Shield,
  Database,
  FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  user_type: string;
  business_name?: string;
  tier?: string;
}

const AdminUserDeletion = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const searchUser = async () => {
    if (!searchEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setLoading(true);
      
      // Search for user in user_profiles
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', searchEmail.trim())
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          toast.error('User not found');
          setUserData(null);
          return;
        }
        throw profileError;
      }

      setUserData(profileData);
    } catch (error) {
      console.error('Error searching user:', error);
      toast.error('Failed to search for user');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    if (!userData) return;

    if (confirmationText !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    try {
      setDeleting(true);

      // Delete user data in order (respecting foreign key constraints)
      const userId = userData.id;

      // 1. Delete FAQ search logs
      await supabase
        .from('faq_search_logs')
        .delete()
        .eq('user_id', userId);

      // 2. Delete business switches
      await supabase
        .from('business_switches')
        .delete()
        .eq('user_id', userId);

      // 3. Delete business memberships
      await supabase
        .from('business_memberships')
        .delete()
        .eq('user_id', userId);

      // 4. Delete business invitations (where user was invited)
      await supabase
        .from('business_invitations')
        .delete()
        .eq('invited_email', userData.email);

      // 5. Delete businesses owned by user
      await supabase
        .from('businesses')
        .delete()
        .eq('owner_id', userId);

      // 6. Delete user subscriptions
      await supabase
        .from('user_subscriptions')
        .delete()
        .eq('user_id', userId);

      // 7. Delete user profile
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      // 8. Delete auth user (this will cascade to other auth-related tables)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        console.error('Error deleting auth user:', authError);
        toast.warning('User data deleted but auth user deletion failed. You may need to delete manually from Supabase Auth.');
      }

      toast.success('User deleted successfully');
      setUserData(null);
      setSearchEmail('');
      setConfirmationText('');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user. Please check the logs for details.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#040458] flex items-center">
          <Trash2 className="h-6 w-6 mr-2 text-red-500" />
          User Deletion
        </h2>
        <p className="text-gray-600">Permanently delete users and all their associated data</p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search User</CardTitle>
          <CardDescription>
            Enter the email address of the user you want to delete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="search-email">Email Address</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search-email"
                  type="email"
                  placeholder="user@example.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={searchUser} 
                disabled={loading}
                className="bg-[#040458] hover:bg-[#faa51a] text-white"
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Details */}
      {userData && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <User className="h-5 w-5 mr-2" />
              User Found
            </CardTitle>
            <CardDescription>
              Review the user details before deletion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{userData.email}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">User Type</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="font-medium capitalize">{userData.user_type}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Created</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{formatDate(userData.created_at)}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Business Name</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Database className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{userData.business_name || 'N/A'}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Tier</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{userData.tier || 'N/A'}</span>
                </div>
              </div>
            </div>

            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Warning:</strong> This action will permanently delete the user and ALL associated data including:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>User profile and authentication data</li>
                  <li>All businesses owned by this user</li>
                  <li>Business memberships and invitations</li>
                  <li>User subscriptions and billing data</li>
                  <li>FAQ search logs and activity data</li>
                </ul>
                This action cannot be undone.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end">
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User Permanently
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Confirm User Deletion
            </DialogTitle>
            <DialogDescription>
              This action is irreversible. Type "DELETE" below to confirm you want to permanently delete this user and all their data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="confirmation">Type "DELETE" to confirm</Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setConfirmationText('');
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteUser}
              disabled={confirmationText !== 'DELETE' || deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserDeletion;
