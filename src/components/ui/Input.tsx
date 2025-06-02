import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="mb-1 block text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-md border border-nav bg-background px-3 py-2 text-text-primary placeholder-text-muted shadow-sm transition-colors',
            'focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue',
            error && 'border-error-DEFAULT focus:border-error-DEFAULT focus:ring-error-DEFAULT',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-error-DEFAULT">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;