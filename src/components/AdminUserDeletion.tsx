import React, { useState, useEffect } from 'react';
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
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AdminUserService, UserData } from '@/services/adminUserService';
import { toast } from 'sonner';

const AdminUserDeletion = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [hasAdminPrivileges, setHasAdminPrivileges] = useState(false);
  const [checkingPrivileges, setCheckingPrivileges] = useState(true);
  const [deletionStatus, setDeletionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Skip privilege checking entirely - allow access to anyone with the link
  useEffect(() => {
    setHasAdminPrivileges(true);
    setCheckingPrivileges(false);
  }, []);

  const searchUser = async () => {
    if (!searchEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Admin privileges check removed - allow access to anyone with the link

    try {
      setLoading(true);
      setDeletionStatus('idle');
      
      const result = await AdminUserService.searchUser(searchEmail.trim());
      
      if (result.success && result.data) {
        setUserData(result.data);
        toast.success('User found successfully');
      } else {
        toast.error(result.error || 'Failed to search user');
        setUserData(null);
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast.error('An unexpected error occurred while searching');
      setUserData(null);
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

    // Admin privileges check removed - allow access to anyone with the link

    try {
      setDeleting(true);
      setDeletionStatus('idle');

      const result = await AdminUserService.deleteUser(userData.id, userData.email);
      
      if (result.success) {
        setDeletionStatus('success');
        
        // Show detailed success message
        if (result.details) {
          toast.success(`User deleted successfully! Deleted ${result.details.deleted_records || 'multiple'} records.`);
        } else {
          toast.success('User deleted successfully');
        }
        
        // Show warning if auth user deletion failed
        if (result.error) {
          toast.warning(result.error);
        }
        
        // Clear form
        setUserData(null);
        setSearchEmail('');
        setConfirmationText('');
        setIsDeleteDialogOpen(false);
      } else {
        setDeletionStatus('error');
        toast.error(result.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setDeletionStatus('error');
      toast.error('An unexpected error occurred while deleting user');
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

  // Show loading state while checking privileges
  if (checkingPrivileges) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#040458]"></div>
          <span className="ml-3 text-gray-600">Checking admin privileges...</span>
        </div>
      </div>
    );
  }

  // Access denied section removed - allow access to anyone with the link

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#040458] flex items-center">
          <Trash2 className="h-6 w-6 mr-2 text-red-500" />
          User Deletion
        </h2>
        <p className="text-gray-600">Permanently delete users and all their associated data</p>
        
        {/* Admin Status Indicator */}
        <div className="mt-2 flex items-center text-sm text-green-600">
          <CheckCircle className="h-4 w-4 mr-1" />
          Admin privileges verified
        </div>
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

            {/* Deletion Status */}
            {deletionStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Success:</strong> User has been deleted successfully.
                </AlertDescription>
              </Alert>
            )}
            
            {deletionStatus === 'error' && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Error:</strong> Failed to delete user. Please check the logs for details.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? 'Deleting...' : 'Delete User Permanently'}
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
