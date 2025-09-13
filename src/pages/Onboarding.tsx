import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AtSign, Check, X } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { checkUsernameAvailability, setUsername, createProfile } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [usernameInput, setUsernameInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const validateUsername = (value: string) => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(value);
  };

  const handleUsernameChange = async (value: string) => {
    setUsernameInput(value);
    setIsAvailable(null);

    if (value.length < 3) return;

    if (!validateUsername(value)) {
      setIsAvailable(false);
      return;
    }

    setIsChecking(true);
    try {
      const available = await checkUsernameAvailability(value);
      setIsAvailable(available);
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleComplete = async () => {
    if (!user || !isAvailable || !usernameInput) return;

    setLoading(true);
    try {
      // Set username
      await setUsername(user.uid, usernameInput);

      // Create default personal profile
      await createProfile(user.uid, {
        profileId: 'personal',
        name: 'Personal',
        currency: 'INR',
      });

      navigate('/dashboard');
      toast({
        title: 'Setup complete!',
        description: 'Your account is ready to use.',
      });
    } catch (error: any) {
      toast({
        title: 'Setup failed',
        description: error.message || 'Failed to complete setup.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-theme-gradient opacity-5" />
      
      <div className="glass w-full max-w-md rounded-lg p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-lg bg-theme-gradient p-3 mx-auto mb-4">
            <div className="h-full w-full rounded bg-white/90 dark:bg-black/90" />
          </div>
          <h1 className="text-2xl font-bold">Choose Your Username</h1>
          <p className="text-muted-foreground mt-2">
            Your unique username will be used for collaboration
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Username</label>
            <div className="relative">
              <Icon
                icon={AtSign}
                size="sm"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => handleUsernameChange(e.target.value.toLowerCase())}
                className="w-full h-10 pl-10 pr-10 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-base"
                placeholder="Choose a unique username"
              />
              {isChecking && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
              {!isChecking && isAvailable !== null && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isAvailable ? (
                    <Icon icon={Check} size="sm" className="text-success" />
                  ) : (
                    <Icon icon={X} size="sm" className="text-destructive" />
                  )}
                </div>
              )}
            </div>
            
            {usernameInput && !isChecking && (
              <p className={`text-xs mt-1 ${isAvailable ? 'text-success' : 'text-destructive'}`}>
                {isAvailable
                  ? 'Username is available!'
                  : usernameInput.length < 3
                  ? 'Username must be at least 3 characters'
                  : !validateUsername(usernameInput)
                  ? 'Username can only contain letters, numbers, and underscores'
                  : 'Username is already taken'}
              </p>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Why do I need a username?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Other users can find and collaborate with you</li>
              <li>• Manage shared business expenses together</li>
              <li>• Control access to your financial data</li>
            </ul>
          </div>

          <Button
            variant="gradient"
            className="w-full"
            onClick={handleComplete}
            disabled={!isAvailable || loading}
            loading={loading}
          >
            Complete Setup
          </Button>
        </div>
      </div>
    </div>
  );
};