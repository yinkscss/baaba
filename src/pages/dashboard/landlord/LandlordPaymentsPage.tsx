import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Search, Filter, DollarSign, Clock, CheckCircle, XCircle, Download, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { usePayments } from '../../../hooks/useDashboard';
import { formatCurrency } from '../../../lib/utils';
import type { Payment } from '../../../types';

const LandlordPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const { data: payments, isLoading } = usePayments(user?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Payment['status'] | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'thisMonth' | 'lastMonth' | 'thisYear'>('all');

  // Calculate payment statistics
  const totalPayments = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const paidPayments = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0) || 0;
  const pendingPayments = payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) || 0;
  const overduePayments = payments?.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0) || 0;

  // Calculate monthly revenue
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = payments?.filter(p => {
    const paymentDate = new Date(p.paymentDate);
    return paymentDate.getMonth() === currentMonth && 
           paymentDate.getFullYear() === currentYear &&
           p.status === 'paid';
  }).reduce((sum, p) => sum + p.amount, 0) || 0;

  // Filter payments based on search, status, and date
  const filteredPayments = payments?.filter(payment => {
    const matchesSearch = 
      payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.amount.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    const paymentDate = new Date(payment.paymentDate);
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

    const matchesDate = 
      dateFilter === 'all' ||
      (dateFilter === 'thisMonth' && paymentDate >= firstDayOfMonth) ||
      (dateFilter === 'lastMonth' && paymentDate >= firstDayOfLastMonth && paymentDate <= lastDayOfLastMonth) ||
      (dateFilter === 'thisYear' && paymentDate >= firstDayOfYear);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const exportPayments = () => {
    // Create CSV content
    const csvContent = [
      ['Date', 'Amount', 'Status', 'Transaction ID'],
      ...filteredPayments!.map(payment => [
        new Date(payment.paymentDate).toLocaleDateString(),
        payment.amount.toString(),
        payment.status,
        payment.transactionId || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
            Payment Center
          </h1>
          <p className="mt-1 text-text-secondary">
            Track and manage payments from your tenants
          </p>
        </div>
        <Button onClick={exportPayments} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border border-nav">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Revenue</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {formatCurrency(totalPayments)}
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
                <p className="text-sm text-text-secondary">This Month</p>
                <p className="mt-1 text-2xl font-bold text-accent-green">
                  {formatCurrency(monthlyRevenue)}
                </p>
              </div>
              <div className="rounded-full bg-accent-green/10 p-3">
                <TrendingUp className="h-6 w-6 text-accent-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-nav">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Paid</p>
                <p className="mt-1 text-2xl font-bold text-accent-green">
                  {formatCurrency(paidPayments)}
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
                  {formatCurrency(pendingPayments)}
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
                <p className="text-sm text-text-secondary">Overdue</p>
                <p className="mt-1 text-2xl font-bold text-error-DEFAULT">
                  {formatCurrency(overduePayments)}
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
            placeholder="Search by transaction ID or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="rounded-md border border-nav bg-background px-4 py-2 text-text-primary"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Payment['status'] | 'all')}
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
        <select
          className="rounded-md border border-nav bg-background px-4 py-2 text-text-primary"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as 'all' | 'thisMonth' | 'lastMonth' | 'thisYear')}
        >
          <option value="all">All Time</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="thisYear">This Year</option>
        </select>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments?.map((payment) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border border-nav">
              <CardContent className="grid gap-6 p-6 md:grid-cols-5">
                {/* Payment Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {payment.status === 'paid' ? (
                      <CheckCircle className="h-5 w-5 text-accent-green" />
                    ) : payment.status === 'pending' ? (
                      <Clock className="h-5 w-5 text-warning-DEFAULT" />
                    ) : (
                      <XCircle className="h-5 w-5 text-error-DEFAULT" />
                    )}
                    <span className="font-medium capitalize text-text-primary">
                      {payment.status}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>

                {/* Date Info */}
                <div>
                  <p className="text-sm text-text-secondary">Payment Date</p>
                  <p className="font-medium text-text-primary">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-text-muted">
                    {new Date(payment.paymentDate).toLocaleTimeString()}
                  </p>
                </div>

                {/* Transaction Info */}
                <div>
                  <p className="text-sm text-text-secondary">Transaction ID</p>
                  <p className="font-medium text-text-primary">
                    {payment.transactionId || 'N/A'}
                  </p>
                </div>

                {/* Created Date */}
                <div>
                  <p className="text-sm text-text-secondary">Created</p>
                  <p className="font-medium text-text-primary">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredPayments?.length === 0 && (
          <div className="rounded-lg border border-nav p-8 text-center">
            <CreditCard className="mx-auto mb-4 h-12 w-12 text-text-muted" />
            <p className="text-text-secondary">No payments found</p>
            <p className="text-sm text-text-muted">
              Payments from your tenants will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandlordPaymentsPage;