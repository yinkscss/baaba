import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';

interface DeletePropertyConfirmationProps {
  propertyTitle: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeletePropertyConfirmation({
  propertyTitle,
  onConfirm,
  onCancel,
  isLoading
}: DeletePropertyConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md">
        <Card className="border border-nav">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-error-DEFAULT flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Delete Property
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-text-primary">
                Are you sure you want to delete <span className="font-semibold">{propertyTitle}</span>?
              </p>
              
              <p className="text-sm text-text-secondary">
                This action cannot be undone. This will permanently delete the property and all associated data.
              </p>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  variant="danger"
                  onClick={onConfirm}
                  isLoading={isLoading}
                >
                  Delete Property
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}