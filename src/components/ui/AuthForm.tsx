import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Chrome } from 'lucide-react';
import { LogoIcon } from '../icons/LogoIcon';
import Input from './Input';
import Button from './Button';

interface AuthFormProps {
  mode: 'login' | 'register';
  onAuthSubmit: (data: any) => Promise<void>;
  error: string | null;
  isLoading?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onAuthSubmit, error, isLoading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAuthSubmit(formData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden w-full rounded-xl">
      {/* Centered glass card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-card/10 to-background backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent-blue/20 mb-6 shadow-lg">
          <LogoIcon className="h-8 w-8 text-accent-blue" />
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-semibold text-text-primary mb-6 text-center">
          BAABA.COM
        </h2>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            {mode === 'register' && (
              <>
                <Input
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <Input
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </>
            )}
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            {error && (
              <div className="text-sm text-error-DEFAULT">{error}</div>
            )}
          </div>
          
          <hr className="opacity-10" />
          
          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full mb-3"
              isLoading={isLoading}
            >
              {mode === 'login' ? 'Sign in' : 'Create Account'}
            </Button>
            
            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 mb-2"
              disabled={isLoading}
            >
              <Chrome size={20} />
              Continue with Google
            </Button>
            
            <div className="w-full text-center mt-2">
              <span className="text-xs text-text-secondary">
                {mode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <Link to="/register" className="text-accent-blue hover:text-accent-blue/80">
                      Sign up, it's free!
                    </Link>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <Link to="/login" className="text-accent-blue hover:text-accent-blue/80">
                      Sign in
                    </Link>
                  </>
                )}
              </span>
            </div>
          </div>
        </form>
      </div>

      {/* User count and avatars */}
      <div className="relative z-10 mt-12 flex flex-col items-center text-center">
        <p className="text-text-secondary text-sm mb-2">
          Join <span className="font-medium text-text-primary">thousands</span> of
          students who are already using BAABA.COM
        </p>
        <div className="flex -space-x-2">
          <img
            src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-background object-cover"
          />
          <img
            src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-background object-cover"
          />
          <img
            src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-background object-cover"
          />
          <img
            src="https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-background object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default AuthForm;