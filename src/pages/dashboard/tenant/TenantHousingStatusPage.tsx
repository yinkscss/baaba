import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Building, Phone, Calendar, Download, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { useCurrentLease, useEscrowTransactions, useInspectionRequests } from '../../../hooks/useDashboard';
import { formatCurrency } from '../../../lib/utils';

const TenantHousingStatusPage: React.FC = () => {
  const { user } = useAuth();
  const { data: lease, isLoading } = useCurrentLease(user?.id || '');
  const { data: escrowTransactions, confirmTenantInspection } = useEscrowTransactions();
  const { data: inspectionRequests } = useInspectionRequests();

  // Filter escrow transactions for current lease
  const currentEscrowTransactions = escrowTransactions?.filter(
    transaction => transaction.leaseId === lease?.id
  ) || [];

  // Filter inspection requests for current user
  const userInspectionRequests = inspectionRequests?.filter(
    request => request.tenantId === user?.id
  ) || [];

  const handleConfirmInspection = async (transactionId: string) => {
    try {
      await confirmTenantInspection.mutateAsync(transactionId);
    } catch (error) {
      console.error('Failed to confirm inspection:', error);
    }
  };

  const getInspectionStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="h-4 w-4 text-warning-DEFAULT" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-accent-green" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-error-DEFAULT" />;
      case 'rescheduled':
        return <Calendar className="h-4 w-4 text-accent-blue" />;
      default:
        return <Clock className="h-4 w-4 text-text-muted" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-r-transparent"></div>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="mb-2 text-xl font-semibold text-text-primary">No Active Lease</h2>
        <p className="text-text-secondary">You don't have any active leases at the moment.</p>
      </div>
    );
  }

  const daysRemaining = Math.ceil(
    (new Date(lease.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
          Current Housing Status
        </h1>
        <p className="mt-1 text-text-secondary">
          View and manage your current rental details
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-nav">
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building className="mt-1 h-5 w-5 text-accent-blue" />
                <div>
                  <h3 className="font-medium text-text-primary">{lease.property?.title}</h3>
                  <p className="text-sm text-text-secondary">{lease.property?.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent-blue" />
                <div>
                  <p className="text-sm text-text-secondary">Landlord Contact</p>
                  <p className="font-medium text-text-primary">
                    {lease.landlordContact?.firstName} {lease.landlordContact?.lastName}
                  </p>
                  <p className="text-sm text-text-secondary">{lease.landlordContact?.phoneNumber}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-nav">
          <CardHeader>
            <CardTitle>Lease Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-accent-blue" />
                <div>
                  <p className="text-sm text-text-secondary">Lease Duration</p>
                  <p className="font-medium text-text-primary">
                    {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-accent-blue">{daysRemaining} days remaining</p>
                </div>
              </div>
              {lease.leaseDocumentUrl && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(lease.leaseDocumentUrl, '_blank')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Lease Agreement
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inspection Requests */}
      {userInspectionRequests.length > 0 && (
        <Card className="border border-nav">
          <CardHeader>
            <CardTitle>Your Inspection Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userInspectionRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-lg border border-nav p-4"
                >
                  <div className="flex items-center gap-3">
                    {getInspectionStatusIcon(request.status)}
                    <div>
                      <p className="font-medium text-text-primary">
                        {request.property?.title}
                      </p>
                      <p className="text-sm text-text-secondary">
                        Requested: {new Date(request.requestedDate).toLocaleDateString()} at {new Date(request.requestedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-text-secondary">
                        Status: <span className="capitalize font-medium">{request.status.replace('_', ' ')}</span>
                      </p>
                      {request.status === 'rescheduled' && request.rescheduleNotes && (
                        <p className="text-xs text-accent-blue mt-1">
                          Rescheduled: {request.rescheduleNotes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Escrow Transactions - Inspection Confirmation */}
      {currentEscrowTransactions.length > 0 && (
        <Card className="border border-nav">
          <CardHeader>
            <CardTitle>Inspection Confirmation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentEscrowTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border border-nav p-4"
                >
                  <div>
                    <p className="font-medium text-text-primary">
                      Escrow Amount: {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Status: <span className="capitalize">{transaction.status.replace('_', ' ')}</span>
                    </p>
                    <p className="text-sm text-text-secondary">
                      Initiated: {new Date(transaction.initiatedAt).toLocaleDateString()}
                    </p>
                    {transaction.tenantConfirmedInspection && (
                      <p className="text-sm text-accent-green">
                        ✓ Inspection confirmed
                      </p>
                    )}
                  </div>
                  
                  {transaction.status === 'pending_release' && !transaction.tenantConfirmedInspection && (
                    <Button
                      onClick={() => handleConfirmInspection(transaction.id)}
                      isLoading={confirmTenantInspection.isLoading}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Inspection
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TenantHousingStatusPage;