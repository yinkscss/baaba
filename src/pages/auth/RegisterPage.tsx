import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthForm from '../../components/ui/AuthForm';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      setError(null);
      await signUp(
        data.email,
        data.password,
        'tenant',
        data.firstName,
        data.lastName
      );
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
      console.error(err);
    }
  };

  return (
    <AuthForm
      mode="register"
      onAuthSubmit={handleSubmit}
      error={error}
    />
  );
};

export default RegisterPage;