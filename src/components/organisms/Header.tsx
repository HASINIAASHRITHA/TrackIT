import React, { useState } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { ProfileToggle } from '@/components/molecules/ProfileToggle';
import { SearchModal } from '@/components/molecules/SearchModal';
import { NotificationCenter } from '@/components/molecules/NotificationCenter';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/atoms/Avatar';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, userData } = useAuth();
  const [showSearchModal, setShowSearchModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 h-14 sm:h-16 bg-card/95 backdrop-blur-md border-b border-border supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
        {/* Left section */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
            title="Open menu"
          >
            <Icon icon={Menu} size="md" />
          </Button>
          
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-6 w-6 sm:h-8 sm:w-8 lg:h-9 lg:w-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <div className="h-2.5 w-2.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 rounded bg-white" />
            </div>
            <h1 className="text-base sm:text-lg lg:text-xl font-semibold hidden xs:block truncate">
              TrackNow
            </h1>
          </div>
        </div>

        {/* Center section - Hidden on small screens, shown on large */}
        <div className="hidden lg:flex items-center">
          <ProfileToggle />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Search Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowSearchModal(true)}
            className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10"
            title="Search transactions and categories"
          >
            <Icon icon={Search} size="md" />
          </Button>
          
          {/* Notifications */}
          <NotificationCenter />
          
          {/* Profile Toggle - Mobile only */}
          <div className="lg:hidden">
            <ProfileToggle />
          </div>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10"
                title="User menu"
              >
                <Avatar className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8">
                  <AvatarImage src={user?.photoURL || ''} />
                  <AvatarFallback className="text-xs sm:text-sm">
                    {userData?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 sm:w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none truncate">
                    {userData?.displayName || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {userData?.email || user?.email}
                  </p>
                  {userData?.username && (
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      @{userData.username}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Help & Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Search Modal */}
      <SearchModal 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)} 
      />
    </header>
  );
};