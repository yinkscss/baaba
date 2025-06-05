import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Building, Phone, Calendar, Download } from 'lucide-react';
import Button from '../../../components/ui/Button';

const TenantHousingStatusPage: React.FC = () => {
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
                  <h3 className="font-medium text-text-primary">Modern Studio Near University of Lagos</h3>
                  <p className="text-sm text-text-secondary">123 University Road, Yaba, Lagos</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent-blue" />
                <div>
                  <p className="text-sm text-text-secondary">Landlord Contact</p>
                  <p className="font-medium text-text-primary">Mr. Oluwaseun Adebayo</p>
                  <p className="text-sm text-text-secondary">+234 801 234 5678</p>
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
                  <p className="font-medium text-text-primary">Sept 1, 2023 - Aug 31, 2024</p>
                  <p className="text-sm text-accent-blue">245 days remaining</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Lease Agreement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TenantHousingStatusPage;