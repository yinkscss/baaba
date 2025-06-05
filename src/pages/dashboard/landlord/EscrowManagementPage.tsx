import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, ArrowRight, Search, Filter, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { useEscrowTransactions } from '../../../hooks/useDashboard';
import { formatCurrency } from '../../../lib/utils';

const EscrowManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: transactions, isLoading, releaseFunds } = useEscrowTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_release' | 'released' | 'refunded'>('all');

  const filteredTransactions = transactions?.filter(transaction => {
    const matchesSearch = 
      transaction.lease?.property_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.amount.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleReleaseFunds = async (transactionId: string) => {
    try {
      await releaseFunds.mutateAsync(transactionId);
    } catch (error) {
      console.error('Failed to release funds:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-r-transparent"></div>
      </div>
    );
  }

  const totalEscrow = filteredTransactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
  const pendingEscrow = filteredTransactions?.filter(tx => tx.status === 'pending_release').reduce((sum, tx) => sum + tx.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
          Escrow Management
        </h1>
        <p className="mt-1 text-text-secondary">
          Manage and track escrow transactions for your properties
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border border-nav">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total in Escrow</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {formatCurrency(totalEscrow)}
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
                <p className="text-sm text-text-secondary">Pending Release</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {formatCurrency(pendingEscrow)}
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
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="rounded-md border border-nav bg-background px-4 py-2 text-text-primary"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="all">All Status</option>
          <option value="pending_release">Pending Release</option>
          <option value="released">Released</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions?.map((transaction) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border border-nav">
              <CardContent className="grid gap-6 p-6 md:grid-cols-3">
                {/* Transaction Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {transaction.status === 'pending_release' ? (
                      <Clock className="h-5 w-5 text-warning-DEFAULT" />
                    ) : transaction.status === 'released' ? (
                      <CheckCircle className="h-5 w-5 text-accent-green" />
                    ) : (
                      <ArrowRight className="h-5 w-5 text-error-DEFAULT" />
                    )}
                    <span className="font-medium capitalize text-text-primary">
                      {transaction.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Initiated: {new Date(transaction.initiatedAt).toLocaleDateString()}
                  </p>
                  {transaction.releasedAt && (
                    <p className="text-sm text-text-secondary">
                      Released: {new Date(transaction.releasedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Lease Info */}
                <div>
                  <h3 className="mb-1 font-medium text-text-primary">
                    Lease Details
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Lease ID: {transaction.leaseId}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Monthly Rent: {formatCurrency(transaction.lease?.rent_amount || 0)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end">
                  {transaction.status === 'pending_release' && (
                    <Button
                      onClick={() => handleReleaseFunds(transaction.id)}
                      isLoading={releaseFunds.isLoading}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Release Funds
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredTransactions?.length === 0 && (
          <div className="rounded-lg border border-nav p-8 text-center">
            <p className="text-text-secondary">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscrowManagementPage;