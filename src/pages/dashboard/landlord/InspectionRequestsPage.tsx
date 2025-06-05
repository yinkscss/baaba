import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Search, Filter, Shield, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { useInspectionRequests } from '../../../hooks/useDashboard';
import type { InspectionRequest } from '../../../types';

const InspectionRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: requests, isLoading, updateStatus } = useInspectionRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InspectionRequest['status'] | 'all'>('all');

  const filteredRequests = requests?.filter(request => {
    const matchesSearch = 
      request.tenant?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.tenant?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.property?.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (requestId: string, status: InspectionRequest['status']) => {
    try {
      await updateStatus.mutateAsync({ requestId, status });
    } catch (error) {
      console.error('Failed to update status:', error);
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
          Inspection Requests
        </h1>
        <p className="mt-1 text-text-secondary">
          Manage and respond to property inspection requests
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search by tenant or property..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="rounded-md border border-nav bg-background px-4 py-2 text-text-primary"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InspectionRequest['status'] | 'all')}
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
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
              <CardContent className="grid gap-6 p-6 md:grid-cols-3">
                {/* Request Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {request.status === 'new' ? (
                      <Clock className="h-5 w-5 text-warning-DEFAULT" />
                    ) : request.status === 'approved' ? (
                      <CheckCircle className="h-5 w-5 text-accent-green" />
                    ) : (
                      <XCircle className="h-5 w-5 text-error-DEFAULT" />
                    )}
                    <span className="font-medium capitalize text-text-primary">
                      {request.status} Request
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {new Date(request.requestedDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-text-primary">{request.message}</p>
                </div>

                {/* Property Info */}
                <div>
                  <h3 className="mb-1 font-medium text-text-primary">
                    {request.property?.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {request.property?.address}
                  </p>
                </div>

                {/* Tenant Info & Actions */}
                <div>
                  <div className="mb-4">
                    <h3 className="mb-1 font-medium text-text-primary">
                      {request.tenant?.firstName} {request.tenant?.lastName}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {request.tenant?.schoolIdVerified && (
                        <span className="flex items-center gap-1 rounded-full bg-accent-green/10 px-2 py-1 text-xs text-accent-green">
                          <Shield className="h-3 w-3" />
                          Verified Student
                        </span>
                      )}
                      {request.tenant?.phoneVerified && (
                        <span className="flex items-center gap-1 rounded-full bg-accent-blue/10 px-2 py-1 text-xs text-accent-blue">
                          <Phone className="h-3 w-3" />
                          Verified Phone
                        </span>
                      )}
                    </div>
                  </div>

                  {request.status === 'new' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleStatusUpdate(request.id, 'rejected')}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleStatusUpdate(request.id, 'approved')}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredRequests?.length === 0 && (
          <div className="rounded-lg border border-nav p-8 text-center">
            <p className="text-text-secondary">No inspection requests found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionRequestsPage;