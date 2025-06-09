import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, MessageSquare, CheckCircle, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useInspectionRequests } from '../../hooks/useDashboard';

interface InspectionRequestFormProps {
  propertyId: string;
  propertyTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  requestedDate: string;
  requestedTime: string;
  message: string;
}

const InspectionRequestForm: React.FC<InspectionRequestFormProps> = ({
  propertyId,
  propertyTitle,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { submitRequest } = useInspectionRequests();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
    requestedDate: '',
    requestedTime: '',
    message: ''
  });

  const totalSteps = 4;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const requestedDateTime = `${formData.requestedDate}T${formData.requestedTime}:00`;
      
      await submitRequest.mutateAsync({
        propertyId,
        tenantId: user.id,
        requestedDate: requestedDateTime,
        message: formData.message || `I would like to schedule an inspection for ${propertyTitle}.`,
        status: 'new'
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to submit inspection request:', error);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.phoneNumber && formData.email;
      case 2:
        return formData.requestedDate && formData.requestedTime;
      case 3:
        return true; // Message is optional
      case 4:
        return true; // Review step
      default:
        return false;
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6 text-center">
              <User className="mx-auto mb-3 h-12 w-12 text-accent-blue" />
              <h3 className="text-lg font-semibold text-text-primary">Confirm Your Details</h3>
              <p className="text-sm text-text-secondary">
                Please verify your contact information
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>

            <Input
              label="Phone Number"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="+234 xxx xxx xxxx"
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled
            />
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6 text-center">
              <Calendar className="mx-auto mb-3 h-12 w-12 text-accent-blue" />
              <h3 className="text-lg font-semibold text-text-primary">Choose Date & Time</h3>
              <p className="text-sm text-text-secondary">
                Select your preferred inspection date and time
              </p>
            </div>

            <Input
              label="Preferred Date"
              type="date"
              value={formData.requestedDate}
              onChange={(e) => handleInputChange('requestedDate', e.target.value)}
              min={getMinDate()}
              required
            />

            <Input
              label="Preferred Time"
              type="time"
              value={formData.requestedTime}
              onChange={(e) => handleInputChange('requestedTime', e.target.value)}
              required
            />

            <div className="rounded-lg bg-nav/50 p-4">
              <p className="text-sm text-text-secondary">
                <strong>Note:</strong> The landlord/agent will review your request and may suggest 
                alternative times if your preferred slot is not available.
              </p>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6 text-center">
              <MessageSquare className="mx-auto mb-3 h-12 w-12 text-accent-blue" />
              <h3 className="text-lg font-semibold text-text-primary">Add a Message</h3>
              <p className="text-sm text-text-secondary">
                Tell the landlord why you're interested (optional)
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Message to Landlord
              </label>
              <textarea
                className="w-full rounded-md border border-nav bg-background px-3 py-2 text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                rows={4}
                placeholder="I'm interested in this property because..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
              />
            </div>

            <div className="rounded-lg bg-accent-blue/10 p-4">
              <p className="text-sm text-accent-blue">
                <strong>Tip:</strong> Mention your budget, move-in timeline, or any specific 
                questions about the property to increase your chances of approval.
              </p>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6 text-center">
              <CheckCircle className="mx-auto mb-3 h-12 w-12 text-accent-green" />
              <h3 className="text-lg font-semibold text-text-primary">Review Your Request</h3>
              <p className="text-sm text-text-secondary">
                Please confirm all details before submitting
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-nav p-4">
                <h4 className="mb-2 font-medium text-text-primary">Property</h4>
                <p className="text-text-secondary">{propertyTitle}</p>
              </div>

              <div className="rounded-lg border border-nav p-4">
                <h4 className="mb-2 font-medium text-text-primary">Contact Information</h4>
                <p className="text-text-secondary">
                  {formData.firstName} {formData.lastName}
                </p>
                <p className="text-text-secondary">{formData.phoneNumber}</p>
                <p className="text-text-secondary">{formData.email}</p>
              </div>

              <div className="rounded-lg border border-nav p-4">
                <h4 className="mb-2 font-medium text-text-primary">Inspection Details</h4>
                <p className="text-text-secondary">
                  Date: {new Date(formData.requestedDate).toLocaleDateString()}
                </p>
                <p className="text-text-secondary">
                  Time: {formData.requestedTime}
                </p>
              </div>

              {formData.message && (
                <div className="rounded-lg border border-nav p-4">
                  <h4 className="mb-2 font-medium text-text-primary">Your Message</h4>
                  <p className="text-text-secondary">{formData.message}</p>
                </div>
              )}
            </div>

            <div className="rounded-lg bg-accent-green/10 p-4">
              <p className="text-sm text-accent-green">
                <strong>What happens next?</strong> The landlord/agent will review your request 
                and respond within 24 hours. You'll receive a notification once they approve 
                or suggest alternative times.
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border border-nav">
          <CardHeader className="relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-text-muted hover:bg-nav hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
            
            <CardTitle className="pr-8">Schedule Inspection</CardTitle>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-text-muted">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-nav">
                <motion.div
                  className="h-full rounded-full bg-accent-blue"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="flex items-center"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  isLoading={submitRequest.isLoading}
                  className="flex items-center"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Request
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default InspectionRequestForm;