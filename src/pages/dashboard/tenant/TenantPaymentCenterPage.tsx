import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { CreditCard, Calendar, ArrowUpRight, Clock, Download, Receipt } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { useCurrentLease, usePayments } from '../../../hooks/useDashboard';
import { formatCurrency } from '../../../lib/utils';
import { PaymentWorkflow } from '../../../components/dashboard/PaymentWorkflow';

const TenantPaymentCenterPage: React.FC = () => {
  const { user } = useAuth();
  const { data: lease } = useCurrentLease(user?.id || '');
  const { data: payments, isLoading } = usePayments(user?.id || '');

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
          Payment Center
        </h1>
        <p className="mt-1 text-text-secondary">
          Manage your rent payments and view payment history
        </p>
      </div>

      {/* Payment Workflow Component */}
      <PaymentWorkflow />

      {/* Payment Schedule */}
      <Card className="border border-nav">
        <CardHeader>
          <CardTitle>Payment Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-accent-blue" />
              <div>
                <p className="font-medium text-text-primary">Annual Payment</p>
                <p className="text-sm text-text-secondary">
                  Next renewal: {lease ? new Date(lease.endDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-nav p-4">
                <p className="text-sm text-text-secondary">Current Lease</p>
                <p className="text-lg font-semibold text-text-primary">
                  {lease ? formatCurrency(lease.rentAmount) : '₦0'}
                </p>
                <p className="text-sm text-text-muted">per year</p>
              </div>
              <div className="rounded-lg border border-nav p-4">
                <p className="text-sm text-text-secondary">Next Payment</p>
                <p className="text-lg font-semibold text-text-primary">
                  {lease ? new Date(lease.endDate).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-text-muted">renewal date</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" disabled={!lease}>
              <Download className="mr-2 h-4 w-4" />
              Download Payment Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="border border-nav">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments?.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border border-nav p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-nav p-2">
                    <CreditCard className="h-5 w-5 text-accent-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-text-secondary">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                    {payment.transactionId && (
                      <p className="text-xs text-text-muted">
                        ID: {payment.transactionId}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    payment.status === 'paid' 
                      ? 'bg-accent-green/10 text-accent-green'
                      : payment.status === 'pending'
                      ? 'bg-warning-DEFAULT/10 text-warning-DEFAULT'
                      : 'bg-error-DEFAULT/10 text-error-DEFAULT'
                  }`}>
                    {payment.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    <Receipt className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {payments?.length === 0 && (
              <div className="text-center py-8">
                <Clock className="mx-auto mb-4 h-12 w-12 text-text-muted" />
                <p className="text-text-secondary">No payment history available</p>
                <p className="text-sm text-text-muted">
                  Your payment history will appear here once you make your first payment
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantPaymentCenterPage;