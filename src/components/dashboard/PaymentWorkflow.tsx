import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Calendar, CheckCircle, Clock, AlertTriangle, Download, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { formatCurrency } from '../../lib/utils';
import { useCurrentLease, usePayments } from '../../hooks/useDashboard';
import { useAuth } from '../../context/AuthContext';

interface PaymentWorkflowProps {
  className?: string;
}

export function PaymentWorkflow({ className }: PaymentWorkflowProps) {
  const { user } = useAuth();
  const { data: lease } = useCurrentLease(user?.id || '');
  const { data: payments } = usePayments(user?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'crypto'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const nextPaymentDue = lease ? new Date(lease.startDate) : null;
  const isOverdue = nextPaymentDue ? nextPaymentDue < new Date() : false;
  const recentPayments = payments?.slice(0, 3) || [];

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentForm(false);
      // Show success message
    }, 3000);
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-accent-green" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning-DEFAULT" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-error-DEFAULT" />;
      default:
        return <Clock className="h-5 w-5 text-text-muted" />;
    }
  };

  return (
    <div className={className}>
      {/* Payment Due Card */}
      <Card className="mb-6 border border-nav">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Next Payment Due</span>
            {isOverdue && (
              <span className="rounded-full bg-error-DEFAULT/10 px-3 py-1 text-sm font-medium text-error-DEFAULT">
                Overdue
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="mb-4">
                <p className="text-3xl font-bold text-accent-blue">
                  {lease ? formatCurrency(lease.rentAmount) : '₦0'}
                </p>
                <p className="text-sm text-text-secondary">
                  Due: {nextPaymentDue ? nextPaymentDue.toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-5 w-5 text-accent-blue" />
                <div>
                  <p className="text-sm text-text-secondary">Payment Schedule</p>
                  <p className="font-medium text-text-primary">Annual Payment</p>
                </div>
              </div>

              <Button 
                className="w-full" 
                disabled={!lease}
                onClick={() => setShowPaymentForm(true)}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Pay Now
              </Button>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-text-primary">Recent Payments</h4>
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border border-nav p-3"
                >
                  <div className="flex items-center gap-3">
                    {getPaymentStatusIcon(payment.status)}
                    <div>
                      <p className="font-medium text-text-primary">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Receipt className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {recentPayments.length === 0 && (
                <p className="text-center text-text-secondary">No payment history</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form Modal */}
      <AnimatePresence>
        {showPaymentForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
            >
              <Card className="border border-nav">
                <CardHeader>
                  <CardTitle>Complete Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Amount */}
                  <div className="text-center">
                    <p className="text-3xl font-bold text-accent-blue">
                      {lease ? formatCurrency(lease.rentAmount) : '₦0'}
                    </p>
                    <p className="text-sm text-text-secondary">Annual Rent Payment</p>
                  </div>

                  {/* Payment Method Selection */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-text-primary">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'card', label: 'Card', icon: CreditCard },
                        { id: 'bank', label: 'Bank', icon: CreditCard },
                        { id: 'crypto', label: 'Crypto', icon: CreditCard }
                      ].map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          onClick={() => setPaymentMethod(id as any)}
                          className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors ${
                            paymentMethod === id
                              ? 'border-accent-blue bg-accent-blue/10'
                              : 'border-nav hover:border-accent-blue/50'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-sm">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Form Fields */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <Input
                        label="Card Number"
                        placeholder="1234 5678 9012 3456"
                        disabled={isProcessing}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Expiry Date"
                          placeholder="MM/YY"
                          disabled={isProcessing}
                        />
                        <Input
                          label="CVV"
                          placeholder="123"
                          disabled={isProcessing}
                        />
                      </div>
                      <Input
                        label="Cardholder Name"
                        placeholder="John Doe"
                        disabled={isProcessing}
                      />
                    </div>
                  )}

                  {paymentMethod === 'bank' && (
                    <div className="space-y-4">
                      <Input
                        label="Account Number"
                        placeholder="1234567890"
                        disabled={isProcessing}
                      />
                      <Input
                        label="Bank Name"
                        placeholder="Select your bank"
                        disabled={isProcessing}
                      />
                    </div>
                  )}

                  {paymentMethod === 'crypto' && (
                    <div className="space-y-4">
                      <div className="rounded-lg bg-nav/50 p-4 text-center">
                        <p className="text-sm text-text-secondary">
                          Scan QR code or copy wallet address
                        </p>
                        <div className="mt-2 h-32 w-32 mx-auto bg-nav rounded-lg flex items-center justify-center">
                          <span className="text-text-muted">QR Code</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowPaymentForm(false)}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handlePayment}
                      isLoading={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Pay Now'}
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
}