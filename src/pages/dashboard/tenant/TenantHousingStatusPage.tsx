import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Building, Phone, Calendar, Download } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { useCurrentLease } from '../../../hooks/useDashboard';
import { formatCurrency } from '../../../lib/utils';

const TenantHousingStatusPage: React.FC = () => {
  const { user } = useAuth();
  const { data: lease, isLoading } = useCurrentLease(user?.id || '');

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
    </div>
  );
};

export default TenantHousingStatusPage;