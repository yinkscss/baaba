import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { CreditCard, Calendar, ArrowUpRight, Clock } from 'lucide-react';
import Button from '../../../components/ui/Button';

const TenantPaymentCenterPage: React.FC = () => {
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-nav">
          <CardHeader>
            <CardTitle>Next Payment Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-accent-blue">₦250,000</p>
                  <p className="text-sm text-text-secondary">Due on Sept 1, 2024</p>
                </div>
                <Clock className="h-8 w-8 text-accent-blue" />
              </div>
              <Button className="w-full">Pay Now</Button>
            </div>
          </CardContent>
        </Card>

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
                  <p className="text-sm text-text-secondary">Next renewal: Aug 31, 2024</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">View Payment Schedule</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-nav">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                amount: 250000,
                date: 'Sept 1, 2023',
                status: 'Paid',
                reference: 'TXN-123456'
              },
              {
                amount: 250000,
                date: 'Sept 1, 2022',
                status: 'Paid',
                reference: 'TXN-123455'
              }
            ].map((payment, index) => (
              <div
                key={payment.reference}
                className="flex items-center justify-between rounded-lg border border-nav p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-nav p-2">
                    <CreditCard className="h-5 w-5 text-accent-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">₦{payment.amount.toLocaleString()}</p>
                    <p className="text-sm text-text-secondary">{payment.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-accent-blue/10 px-2 py-1 text-xs font-medium text-accent-blue">
                    {payment.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantPaymentCenterPage;