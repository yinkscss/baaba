import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Search, Filter, Shield, Phone, Calendar, Edit, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { useInspectionRequests } from '../../../hooks/useDashboard';
import type { InspectionRequest } from '../../../types';

const InspectionRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: requests, isLoading, updateStatus, rescheduleRequest } = useInspectionRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InspectionRequest['status'] | 'all'>('all');
  const [rescheduleData, setRescheduleData] = useState<{
    requestId: string;
    newDate: string;
    newTime: string;
    newMessage: string;
  } | null>(null);

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

  const handleReschedule = (request: InspectionRequest) => {
    const currentDate = new Date(request.requestedDate);
    setRescheduleData({
      requestId: request.id,
      newDate: currentDate.toISOString().split('T')[0],
      newTime: currentDate.toTimeString().slice(0, 5),
      newMessage: request.message
    });
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleData || !user) return;

    try {
      const newRequestedDate = `${rescheduleData.newDate}T${rescheduleData.newTime}:00`;
      
      await rescheduleRequest.mutateAsync({
        requestId: rescheduleData.requestId,
        newRequestedDate,
        newMessage: rescheduleData.newMessage,
        rescheduledByUserId: user.id
      });

      setRescheduleData(null);
    } catch (error) {
      console.error('Failed to reschedule request:', error);
    }
  };

  const getStatusIcon = (status: InspectionRequest['status']) => {
    switch (status) {
      case 'new':
        return <Clock className="h-5 w-5 text-warning-DEFAULT" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-accent-green" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-error-DEFAULT" />;
      case 'rescheduled':
        return <Calendar className="h-5 w-5 text-accent-blue" />;
      default:
        return <Clock className="h-5 w-5 text-text-muted" />;
    }
  };

  const getStatusColor = (status: InspectionRequest['status']) => {
    switch (status) {
      case 'new':
        return 'text-warning-DEFAULT bg-warning-DEFAULT/10';
      case 'approved':
        return 'text-accent-green bg-accent-green/10';
      case 'rejected':
        return 'text-error-DEFAULT bg-error-DEFAULT/10';
      case 'rescheduled':
        return 'text-accent-blue bg-accent-blue/10';
      default:
        return 'text-text-muted bg-nav/10';
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
          <option value="rescheduled">Rescheduled</option>
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
                      {getStatusIcon(request.status)}
                      <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">
                      Requested: {new Date(request.requestedDate).toLocaleDateString()} at {new Date(request.requestedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-text-primary">{request.message}</p>
                    {request.status === 'rescheduled' && request.rescheduleNotes && (
                      <div className="mt-2 rounded-lg bg-accent-blue/10 p-2">
                        <p className="text-xs text-accent-blue font-medium">Reschedule Notes:</p>
                        <p className="text-xs text-text-secondary">{request.rescheduleNotes}</p>
                        {request.rescheduler && (
                          <p className="text-xs text-text-muted">
                            Rescheduled by: {request.rescheduler.firstName} {request.rescheduler.lastName}
                          </p>
                        )}
                      </div>
                    )}
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

                  {/* Tenant Info */}
                  <div>
                    <h3 className="mb-1 font-medium text-text-primary">
                      {request.tenant?.firstName} {request.tenant?.lastName}
                    </h3>
                    <p className="text-sm text-text-secondary mb-2">
                      {request.tenant?.email}
                    </p>
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

                  {/* Actions */}
                  <div className="space-y-2">
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
                    
                    {(request.status === 'new' || request.status === 'approved') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleReschedule(request)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Reschedule
                      </Button>
                    )}
                  </div>
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

      {/* Reschedule Modal */}
      <AnimatePresence>
        {rescheduleData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
            >
              <Card className="border border-nav">
                <CardHeader>
                  <CardTitle>Reschedule Inspection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="New Date"
                    type="date"
                    value={rescheduleData.newDate}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />

                  <Input
                    label="New Time"
                    type="time"
                    value={rescheduleData.newTime}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, newTime: e.target.value })}
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      Message to Tenant
                    </label>
                    <textarea
                      className="w-full rounded-md border border-nav bg-background px-3 py-2 text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                      rows={3}
                      placeholder="Explain the reason for rescheduling..."
                      value={rescheduleData.newMessage}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, newMessage: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setRescheduleData(null)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleRescheduleSubmit}
                      isLoading={rescheduleRequest.isLoading}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Reschedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InspectionRequestsPage;