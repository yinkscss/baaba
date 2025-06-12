import React from 'react';

interface LogoIconProps {
  className?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ className }) => {
  return (
    <div className={`${className || ''} flex items-center justify-center`}>
      <img 
        src="/BAABA 1.png" 
        alt="BAABA.ng Logo" 
        className="h-full w-full object-contain"
      />
    </div>
  );
};