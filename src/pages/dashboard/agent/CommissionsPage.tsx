import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Search, DollarSign, Clock, CheckCircle, XCircle, Edit3, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { useCommissions, Commission } from '../../../hooks/useDashboard';
import { formatCurrency } from '../../../lib/utils';

const CommissionsPage: React.FC = () => {
  const { user } = useAuth();
  const { data: commissions, isLoading, updateCommissionNotes } = useCommissions(user?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Commission['status'] | 'all'>('all');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');

  // Calculate commission statistics
  const totalCommissions = commissions?.reduce((sum, commission) => sum + commission.amount, 0) || 0;
  const paidCommissions = commissions?.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0) || 0;
  const pendingCommissions = commissions?.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0) || 0;

  // Filter commissions based on search and status
  const filteredCommissions = commissions?.filter(commission => {
    const matchesSearch = 
      commission.lease?.property?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commission.lease?.tenant?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commission.lease?.tenant?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commission.amount.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || commission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleEditNotes = (commissionId: string, currentNotes: string) => {
    setEditingNotes(commissionId);
    setNotesValue(currentNotes || '');
  };

  const handleSaveNotes = async (commissionId: string) => {
    try {
      await updateCommissionNotes.mutateAsync({ commissionId, notes: notesValue });
      setEditingNotes(null);
      setNotesValue('');
    } catch (error) {
      console.error('Failed to update notes:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingNotes(null);
    setNotesValue('');
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
          Commission Tracker
        </h1>
        <p className="mt-1 text-text-secondary">
          Track your earnings and commission payments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border border-nav">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Commissions</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {formatCurrency(totalCommissions)}
                </p>
              </div>
              <div className="rounded-full bg-accent-blue/10 p-3">
                <DollarSign className="h-6 w-6 text-accent-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-nav">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Paid Out</p>
                <p className="mt-1 text-2xl font-bold text-accent-green">
                  {formatCurrency(paidCommissions)}
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
                <p className="text-sm text-text-secondary">Pending</p>
                <p className="mt-1 text-2xl font-bold text-warning-DEFAULT">
                  {formatCurrency(pendingCommissions)}
                </p>
              </div>
              <div className="rounded-full bg-warning-DEFAULT/10 p-3">
                <Clock className="h-6 w-6 text-warning-DEFAULT" />
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
            placeholder="Search by property, tenant, or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="rounded-md border border-nav bg-background px-4 py-2 text-text-primary"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Commission['status'] | 'all')}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Commissions List */}
      <div className="space-y-4">
        {filteredCommissions?.map((commission) => (
          <motion.div
            key={commission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border border-nav">
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-4">
                  {/* Commission Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {commission.status === 'paid' ? (
                        <CheckCircle className="h-5 w-5 text-accent-green" />
                      ) : commission.status === 'pending' ? (
                        <Clock className="h-5 w-5 text-warning-DEFAULT" />
                      ) : (
                        <XCircle className="h-5 w-5 text-error-DEFAULT" />
                      )}
                      <span className="font-medium capitalize text-text-primary">
                        {commission.status}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-text-primary">
                      {formatCurrency(commission.amount)}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Created: {new Date(commission.createdAt).toLocaleDateString()}
                    </p>
                    {commission.payoutDate && (
                      <p className="text-sm text-text-secondary">
                        Paid: {new Date(commission.payoutDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Property Info */}
                  <div>
                    <h3 className="mb-1 font-medium text-text-primary">
                      {commission.lease?.property?.title || 'Property'}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {commission.lease?.property?.address || 'Address not available'}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Rent: {formatCurrency(commission.lease?.rentAmount || 0)}
                    </p>
                  </div>

                  {/* Tenant Info */}
                  <div>
                    <h3 className="mb-1 font-medium text-text-primary">
                      {commission.lease?.tenant?.firstName} {commission.lease?.tenant?.lastName}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {commission.lease?.tenant?.email}
                    </p>
                  </div>

                  {/* Notes Section */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-text-primary">Notes</h4>
                      {editingNotes !== commission.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNotes(commission.id, commission.notes || '')}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {editingNotes === commission.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          className="w-full rounded-md border border-nav bg-background px-3 py-2 text-sm text-text-primary"
                          rows={3}
                          placeholder="Add notes about this commission..."
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveNotes(commission.id)}
                            isLoading={updateCommissionNotes.isLoading}
                          >
                            <Save className="mr-1 h-3 w-3" />
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            <X className="mr-1 h-3 w-3" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-text-secondary">
                        {commission.notes || 'No notes added'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredCommissions?.length === 0 && (
          <div className="rounded-lg border border-nav p-8 text-center">
            <CreditCard className="mx-auto mb-4 h-12 w-12 text-text-muted" />
            <p className="text-text-secondary">No commissions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionsPage;