import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCheck, Search, Filter, Clock, CheckCircle, XCircle, 
  FileText, Shield, Phone, ExternalLink, Eye, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { useVerificationRequests, VerificationRequest } from '../../../hooks/useDashboard';

const VerificationQueuePage: React.FC = () => {
  const { user } = useAuth();
  const { data: requests, isLoading, updateVerificationStatus } = useVerificationRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VerificationRequest['status'] | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<VerificationRequest['type'] | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Filter requests based on search, status, and type
  const filteredRequests = requests?.filter(request => {
    const matchesSearch = 
      request.user?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleApprove = async (requestId: string) => {
    try {
      await updateVerificationStatus.mutateAsync({
        requestId,
        status: 'approved',
        notes: reviewNotes,
        reviewedBy: user?.id || ''
      });
      setSelectedRequest(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await updateVerificationStatus.mutateAsync({
        requestId,
        status: 'rejected',
        notes: reviewNotes,
        reviewedBy: user?.id || ''
      });
      setSelectedRequest(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const getTypeLabel = (type: VerificationRequest['type']) => {
    switch (type) {
      case 'tenant_id_verification':
        return 'Student ID Verification';
      case 'landlord_contract_verification':
        return 'Landlord Contract Verification';
      case 'agent_license_verification':
        return 'Agent License Verification';
      default:
        return type;
    }
  };

  const getTypeIcon = (type: VerificationRequest['type']) => {
    switch (type) {
      case 'tenant_id_verification':
        return <UserCheck className="h-5 w-5 text-accent-blue" />;
      case 'landlord_contract_verification':
        return <FileText className="h-5 w-5 text-accent-green" />;
      case 'agent_license_verification':
        return <Shield className="h-5 w-5 text-warning-DEFAULT" />;
      default:
        return <FileText className="h-5 w-5 text-text-secondary" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
          Verification Queue
        </h1>
        <p className="mt-1 text-text-secondary">
          Review and process user verification requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-nav">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Requests</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {requests?.length || 0}
                </p>
              </div>
              <div className="rounded-full bg-accent-blue/10 p-3">
                <UserCheck className="h-6 w-6 text-accent-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-nav">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Pending</p>
                <p className="mt-1 text-2xl font-bold text-warning-DEFAULT">
                  {requests?.filter(r => r.status === 'pending').length || 0}
                </p>
              </div>
              <div className="rounded-full bg-warning-DEFAULT/10 p-3">
                <Clock className="h-6 w-6 text-warning-DEFAULT" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-nav">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Approved</p>
                <p className="mt-1 text-2xl font-bold text-accent-green">
                  {requests?.filter(r => r.status === 'approved').length || 0}
                </p>
              </div>
              <div className="rounded-full bg-accent-green/10 p-3">
                <CheckCircle className="h-6 w-6 text-accent-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-nav">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Rejected</p>
                <p className="mt-1 text-2xl font-bold text-error-DEFAULT">
                  {requests?.filter(r => r.status === 'rejected').length || 0}
                </p>
              </div>
              <div className="rounded-full bg-error-DEFAULT/10 p-3">
                <XCircle className="h-6 w-6 text-error-DEFAULT" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search by name, email, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="rounded-md border border-nav bg-background px-4 py-2 text-text-primary"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as VerificationRequest['status'] | 'all')}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          className="rounded-md border border-nav bg-background px-4 py-2 text-text-primary"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as VerificationRequest['type'] | 'all')}
        >
          <option value="all">All Types</option>
          <option value="tenant_id_verification">Student ID</option>
          <option value="landlord_contract_verification">Landlord Contract</option>
          <option value="agent_license_verification">Agent License</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests?.map((request) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border border-nav">
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-4">
                  {/* Request Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {request.status === 'pending' ? (
                        <Clock className="h-5 w-5 text-warning-DEFAULT" />
                      ) : request.status === 'approved' ? (
                        <CheckCircle className="h-5 w-5 text-accent-green" />
                      ) : (
                        <XCircle className="h-5 w-5 text-error-DEFAULT" />
                      )}
                      <span className="font-medium capitalize text-text-primary">
                        {request.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(request.type)}
                      <span className="text-sm text-text-secondary">
                        {getTypeLabel(request.type)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">
                      Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                    </p>
                    {request.reviewedAt && (
                      <p className="text-sm text-text-secondary">
                        Reviewed: {new Date(request.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* User Info */}
                  <div>
                    <h3 className="mb-1 font-medium text-text-primary">
                      {request.user?.firstName} {request.user?.lastName}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {request.user?.email}
                    </p>
                    {request.user?.phoneNumber && (
                      <p className="text-sm text-text-secondary">
                        {request.user.phoneNumber}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-nav px-2 py-1 text-xs font-medium text-text-primary">
                        {request.user?.role}
                      </span>
                      {request.user?.schoolIdVerified && (
                        <span className="flex items-center gap-1 rounded-full bg-accent-green/10 px-2 py-1 text-xs text-accent-green">
                          <Shield className="h-3 w-3" />
                          ID Verified
                        </span>
                      )}
                      {request.user?.phoneVerified && (
                        <span className="flex items-center gap-1 rounded-full bg-accent-blue/10 px-2 py-1 text-xs text-accent-blue">
                          <Phone className="h-3 w-3" />
                          Phone Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Document */}
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-text-primary">Document</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(request.documentUrl, '_blank')}
                      className="w-full"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Document
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </div>

                  {/* Actions */}
                  <div>
                    {request.status === 'pending' ? (
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setSelectedRequest(request);
                            setReviewNotes('');
                          }}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Review
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {request.reviewer && (
                          <p className="text-sm text-text-secondary">
                            Reviewed by: {request.reviewer.firstName} {request.reviewer.lastName}
                          </p>
                        )}
                        {request.notes && (
                          <div className="rounded-md bg-nav/50 p-2">
                            <p className="text-sm text-text-secondary">
                              <strong>Notes:</strong> {request.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredRequests?.length === 0 && (
          <div className="rounded-lg border border-nav p-8 text-center">
            <UserCheck className="mx-auto mb-4 h-12 w-12 text-text-muted" />
            <p className="text-text-secondary">No verification requests found</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md border border-nav">
            <CardHeader>
              <CardTitle>Review Verification Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-text-primary">
                  {selectedRequest.user?.firstName} {selectedRequest.user?.lastName}
                </p>
                <p className="text-sm text-text-secondary">
                  {getTypeLabel(selectedRequest.type)}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full rounded-md border border-nav bg-background px-3 py-2 text-text-primary"
                  rows={3}
                  placeholder="Add any notes about this verification..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleReject(selectedRequest.id)}
                  isLoading={updateVerificationStatus.isLoading}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleApprove(selectedRequest.id)}
                  isLoading={updateVerificationStatus.isLoading}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setSelectedRequest(null);
                  setReviewNotes('');
                }}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VerificationQueuePage;