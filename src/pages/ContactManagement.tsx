import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  Clock, 
  User, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  Send,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  user_id?: string;
  admin_notes?: string;
  response_sent: boolean;
  response_content?: string;
  created_at: string;
  updated_at: string;
}

const ContactManagement = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [responseContent, setResponseContent] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);

  // Load messages immediately since this is in the admin portal
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading messages:', error);
        toast.error('Failed to load contact messages');
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', messageId);

      if (error) {
        console.error('Error updating status:', error);
        toast.error('Failed to update status');
        return;
      }

      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: status as any } : msg
      ));

      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, status: status as any } : null);
      }

      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const sendResponse = async () => {
    if (!selectedMessage || !responseContent.trim()) {
      toast.error('Please enter a response message');
      return;
    }

    try {
      setSendingResponse(true);

      // Update the message with response
      const { error } = await supabase
        .from('contact_messages')
        .update({
          response_content: responseContent,
          response_sent: true,
          response_sent_at: new Date().toISOString(),
          status: 'resolved'
        })
        .eq('id', selectedMessage.id);

      if (error) {
        console.error('Error sending response:', error);
        toast.error('Failed to send response');
        return;
      }

      // Send email to user (using Supabase Edge Function)
      const { error: emailError } = await supabase.functions.invoke('send-contact-response', {
        body: {
          toEmail: selectedMessage.email,
          toName: selectedMessage.name,
          subject: `Re: ${selectedMessage.subject}`,
          message: responseContent,
          originalMessage: selectedMessage.message
        }
      });

      if (emailError) {
        console.warn('Email sending failed:', emailError);
        toast.warning('Response saved but email failed to send');
      } else {
        toast.success('Response sent successfully');
      }

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === selectedMessage.id 
          ? { 
              ...msg, 
              response_content: responseContent,
              response_sent: true,
              response_sent_at: new Date().toISOString(),
              status: 'resolved'
            } 
          : msg
      ));

      setSelectedMessage(prev => prev ? {
        ...prev,
        response_content: responseContent,
        response_sent: true,
        response_sent_at: new Date().toISOString(),
        status: 'resolved'
      } : null);

      setResponseContent('');
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    } finally {
      setSendingResponse(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Management</h1>
          <p className="text-gray-600">Manage customer inquiries and support requests</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>

          <Button onClick={loadMessages} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Messages ({filteredMessages.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <div className="text-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500">Loading messages...</p>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No messages found</p>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedMessage?.id === message.id
                          ? 'border-[#040458] bg-[#040458]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm truncate">{message.subject}</h3>
                        <Badge className={`${getStatusColor(message.status)} text-xs`}>
                          {message.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{message.name} ({message.email})</p>
                      <p className="text-xs text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(message.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Message Details */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                      <CardDescription className="mt-1">
                        From: {selectedMessage.name} ({selectedMessage.email})
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getStatusColor(selectedMessage.status)}>
                        {selectedMessage.status}
                      </Badge>
                      <Badge className={getPriorityColor(selectedMessage.priority)}>
                        {selectedMessage.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Original Message */}
                  <div>
                    <h3 className="font-medium mb-2">Original Message</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Received: {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Status Actions */}
                  <div>
                    <h3 className="font-medium mb-2">Quick Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      {['new', 'in_progress', 'resolved', 'closed'].map((status) => (
                        <Button
                          key={status}
                          variant={selectedMessage.status === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateMessageStatus(selectedMessage.id, status)}
                          className={selectedMessage.status === status ? "bg-[#040458] text-white" : ""}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Response Section */}
                  <div>
                    <h3 className="font-medium mb-2">Send Response</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="response">Response Message</Label>
                        <Textarea
                          id="response"
                          placeholder="Type your response here..."
                          value={responseContent}
                          onChange={(e) => setResponseContent(e.target.value)}
                          className="mt-1"
                          rows={4}
                        />
                      </div>
                      <Button
                        onClick={sendResponse}
                        disabled={sendingResponse || !responseContent.trim()}
                        className="bg-[#040458] hover:bg-[#faa51a] text-white"
                      >
                        {sendingResponse ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Response
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Previous Response */}
                  {selectedMessage.response_sent && selectedMessage.response_content && (
                    <div>
                      <h3 className="font-medium mb-2">Previous Response</h3>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{selectedMessage.response_content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          <CheckCircle className="h-3 w-3 inline mr-1" />
                          Sent: {selectedMessage.response_sent_at ? new Date(selectedMessage.response_sent_at).toLocaleString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Message</h3>
                  <p className="text-gray-600">Choose a message from the list to view details and respond</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactManagement;
