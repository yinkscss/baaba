import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ArrowLeft } from 'lucide-react';
import Button from './Button';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface StickySignInProps {
  className?: string;
}

export function StickySignIn({ className }: StickySignInProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = () => {
    if (user) {
      // Navigate to the appropriate dashboard based on user role
      const dashboardPath = user.role === 'tenant' ? '/dashboard/tenant' : '/dashboard/landlord';
      navigate(dashboardPath);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className={cn(
      "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
      "md:fixed md:bottom-auto md:left-auto md:right-4 md:top-4 md:translate-x-0",
      className
    )}>
      <Button 
        onClick={handleClick}
        className="shadow-lg"
      >
        {user ? (
          <>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Sign in
          </>
        )}
      </Button>
    </div>
  );
}