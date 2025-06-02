import React from 'react';

interface LogoIconProps {
  className?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ className }) => {
  return (
    <div className={`${className || ''} flex items-center justify-center rounded-md bg-gradient-to-br from-accent-blue to-accent-green p-1`}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="text-background"
      >
        <path 
          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" 
          fill="currentColor"
        />
        <path 
          d="M8 7C8 8.1 8.9 9 10 9C11.1 9 12 8.1 12 7C12 5.9 11.1 5 10 5C8.9 5 8 5.9 8 7Z" 
          fill="currentColor"
        />
        <path 
          d="M14 17C14 15.9 13.1 15 12 15C10.9 15 10 15.9 10 17C10 18.1 10.9 19 12 19C13.1 19 14 18.1 14 17Z" 
          fill="currentColor"
        />
        <path 
          d="M16 12C16 10.9 15.1 10 14 10C12.9 10 12 10.9 12 12C12 13.1 12.9 14 14 14C15.1 14 16 13.1 16 12Z" 
          fill="currentColor"
        />
        <path 
          d="M6 14C7.1 14 8 13.1 8 12C8 10.9 7.1 10 6 10C4.9 10 4 10.9 4 12C4 13.1 4.9 14 6 14Z" 
          fill="currentColor"
        />
      </svg>
    </div>
  );
};