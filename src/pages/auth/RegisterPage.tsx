import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthForm from '../../components/ui/AuthForm';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setError(null);
      setIsLoading(true);
      await signUp(
        data.email,
        data.password,
        data.firstName,
        data.lastName
      );
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      mode="register"
      onAuthSubmit={handleSubmit}
      error={error}
      isLoading={isLoading}
    />
  );
};

export default RegisterPage;