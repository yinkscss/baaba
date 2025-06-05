import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { MessageSquare, AlertTriangle, CheckCircle, Clock, Star } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { useComplaints } from '../../../hooks/useDashboard';
import type { Complaint } from '../../../types';

const TenantComplaintSystemPage: React.FC = () => {
  const { user } = useAuth();
  const { data: complaints, isLoading, submitComplaint } = useComplaints(user?.id || '');
  const [newComplaint, setNewComplaint] = useState({
    subject: '',
    description: '',
    category: 'maintenance' as Complaint['category']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitComplaint.mutateAsync({
        ...newComplaint,
        status: 'open',
        priority: 'medium'
      });
      setNewComplaint({ subject: '', description: '', category: 'maintenance' });
    } catch (error) {
      console.error('Failed to submit complaint:', error);
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
          Complaints & Requests
        </h1>
        <p className="mt-1 text-text-secondary">
          Submit and track your maintenance requests and complaints
        </p>
      </div>

      <Card className="border border-nav">
        <CardHeader>
          <CardTitle>New Complaint</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Subject"
              placeholder="e.g., Leaking roof, No electricity"
              value={newComplaint.subject}
              onChange={(e) => setNewComplaint({ ...newComplaint, subject: e.target.value })}
            />
            
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Category
              </label>
              <select
                className="w-full rounded-md border border-nav bg-background px-3 py-2 text-text-primary"
                value={newComplaint.category}
                onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value as Complaint['category'] })}
              >
                <option value="maintenance">Maintenance</option>
                <option value="noise">Noise</option>
                <option value="billing">Billing</option>
                <option value="security">Security</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Description
              </label>
              <textarea
                className="w-full rounded-md border border-nav bg-background px-3 py-2 text-text-primary"
                rows={4}
                placeholder="Describe your issue in detail..."
                value={newComplaint.description}
                onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              isLoading={submitComplaint.isLoading}
            >
              Submit Complaint
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-nav">
        <CardHeader>
          <CardTitle>Recent Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complaints?.map((complaint) => (
              <div
                key={complaint.id}
                className="rounded-lg border border-nav p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-nav p-2">
                      <MessageSquare className="h-5 w-5 text-accent-blue" />
                    </div>
                    <div>
                      <h3 className="font-medium text-text-primary">{complaint.subject}</h3>
                      <p className="text-sm text-text-secondary">{complaint.category}</p>
                    </div>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-medium ${
                    complaint.status === 'resolved'
                      ? 'bg-accent-green/10 text-accent-green'
                      : complaint.status === 'in_progress'
                      ? 'bg-warning-DEFAULT/10 text-warning-DEFAULT'
                      : 'bg-error-DEFAULT/10 text-error-DEFAULT'
                  }`}>
                    {complaint.status === 'resolved' && <CheckCircle className="h-4 w-4" />}
                    {complaint.status === 'in_progress' && <Clock className="h-4 w-4" />}
                    {complaint.status === 'open' && <AlertTriangle className="h-4 w-4" />}
                  </div>
                </div>
                <p className="mb-4 text-sm text-text-secondary">{complaint.description}</p>
                {complaint.status === 'resolved' && !complaint.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-warning-DEFAULT" />
                    <span className="text-sm text-text-secondary">Rate Resolution</span>
                  </div>
                )}
              </div>
            ))}
            {complaints?.length === 0 && (
              <p className="text-center text-text-secondary">No complaints submitted yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantComplaintSystemPage;