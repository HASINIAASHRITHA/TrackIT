import React from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export const ProfileToggle: React.FC = () => {
  const { profileType, setProfileType } = useAuth();

  return (
    <div className="relative inline-flex items-center rounded-full bg-muted p-1">
      <div
        className={cn(
          "absolute h-8 rounded-full bg-theme-gradient transition-all duration-base ease-spring",
          profileType === 'personal' ? 'left-1 w-[88px]' : 'left-[92px] w-[88px]'
        )}
      />
      <button
        onClick={() => setProfileType('personal')}
        className={cn(
          "relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-base",
          profileType === 'personal' 
            ? 'text-white' 
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Personal
      </button>
      <button
        onClick={() => setProfileType('business')}
        className={cn(
          "relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-base",
          profileType === 'business' 
            ? 'text-white' 
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Business
      </button>
    </div>
  );
};