import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
}

export const FacebookLogo: React.FC<LogoProps> = ({ className, color = '#1877F2' }) => (
  <svg viewBox="0 0 24 24" className={className} fill={color}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export const SpotifyLogo: React.FC<LogoProps> = ({ className, color = '#1DB954' }) => (
  <svg viewBox="0 0 24 24" className={className} fill={color}>
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

export const LawScaleLogo: React.FC<LogoProps> = ({ className, color = '#8B4513' }) => (
  <svg viewBox="0 0 24 24" className={className} fill={color}>
    <path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-8-7c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zm16 0c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zm-8-3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);

export const BrainChipLogo: React.FC<LogoProps> = ({ className, color = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" className={className} fill={color}>
    <path d="M9 2v2h6V2H9zm3 2v2h2V4h-2zm0 2H8v2h4V6zm0 2v6h2V8h-2zm0 6H4v2h8v-2zm0 2v2h2v-2h-2zm0 2H9v2h3v-2z"/>
  </svg>
);

export const HousingLogo: React.FC<LogoProps> = ({ className, color = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" className={className} fill={color}>
    <path d="M23 9.32l-11-7-11 7v2h2v10h8v-6h2v6h8v-10h2z"/>
  </svg>
);

export const StudentLogo: React.FC<LogoProps> = ({ className, color = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" className={className} fill={color}>
    <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
  </svg>
);