import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface StickySignInProps {
  className?: string;
}

export function StickySignIn({ className }: StickySignInProps) {
  const navigate = useNavigate();

  return (
    <div className={cn(
      // Mobile positioning
      "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
      // Desktop positioning
      "md:fixed md:bottom-auto md:left-auto md:right-4 md:top-4 md:translate-x-0",
      className
    )}>
      <div className="inline-flex -space-x-px divide-x divide-primary-foreground/30 rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse">
        <Button
          className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
          size="icon"
          aria-label="QR code"
        >
          <QrCode size={16} strokeWidth={2} aria-hidden="true" />
        </Button>
        <Button 
          className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
          onClick={() => navigate('/login')}
        >
          Sign in
        </Button>
      </div>
    </div>
  );
}