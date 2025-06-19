import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Button from './Button';
import { cn } from '../../lib/utils';

interface StickySignInProps {
  className?: string;
  isFixed?: boolean;
}

export function StickySignIn({ className, isFixed = true }: StickySignInProps) {
  const navigate = useNavigate();

  return (
    <div className={cn(
      isFixed ? "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:fixed md:bottom-auto md:left-auto md:right-4 md:top-4 md:translate-x-0" : "",
      className
    )}>
      <Button 
        onClick={() => navigate('/login')}
        className="shadow-lg text-white"
      >
        <LogIn className="mr-2 h-4 w-4 text-white" />
        <span className="text-white">Sign in</span>
      </Button>
    </div>
  );
}