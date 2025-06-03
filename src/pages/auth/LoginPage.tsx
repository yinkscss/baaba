import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthForm from '../../components/ui/AuthForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setError(null);
      setIsLoading(true);
      await signIn(data.email, data.password);
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      mode="login"
      onAuthSubmit={handleSubmit}
      error={error}
      isLoading={isLoading}
    />
  );
};

export default LoginPage;