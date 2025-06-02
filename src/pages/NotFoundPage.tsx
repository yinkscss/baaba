import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/ui/Button';
import { LogoIcon } from '../components/icons/LogoIcon';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-text-primary">
      <LogoIcon className="mb-8 h-16 w-16" />
      
      <h1 className="mb-4 text-6xl font-bold text-accent-blue">404</h1>
      <h2 className="mb-6 text-2xl font-semibold">Page Not Found</h2>
      
      <p className="mb-8 max-w-md text-center text-text-secondary">
        The page you're looking for doesn't exist or has been moved. 
        Let's get you back on track.
      </p>
      
      <div className="space-y-4">
        <Button onClick={() => navigate('/')}>
          <Home size={18} className="mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;