import React from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses = {
    primary: 'bg-accent-blue hover:bg-accent-blue/90 text-background focus:ring-accent-blue',
    secondary: 'bg-nav hover:bg-nav/80 text-text-primary focus:ring-nav',
    outline: 'border border-nav bg-transparent hover:bg-nav/10 text-text-primary focus:ring-nav',
    ghost: 'bg-transparent hover:bg-nav/10 text-text-primary focus:ring-nav',
    link: 'bg-transparent underline-offset-4 hover:underline text-accent-blue hover:bg-transparent focus:ring-transparent p-0',
    danger: 'bg-error-DEFAULT hover:bg-error-dark text-background focus:ring-error-DEFAULT',
  };
  
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 h-8',
    md: 'text-sm px-4 py-2 h-10',
    lg: 'text-base px-6 py-3 h-12',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;