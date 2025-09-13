import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, FolderOpen, ChartBar, Settings, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: CreditCard, label: 'Transactions', path: '/transactions' },
  { icon: FolderOpen, label: 'Categories', path: '/categories' },
  { icon: ChartBar, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, isOpen, onClose }) => {
  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  }, [onClose]);

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-card/95 backdrop-blur-md border-r border-border transition-all duration-300 z-50 overflow-y-auto",
        // Mobile styles
        "lg:top-14 lg:h-[calc(100vh-3.5rem)] xl:top-16 xl:h-[calc(100vh-4rem)]",
        // Desktop width
        "lg:z-30",
        collapsed ? "lg:w-16" : "lg:w-64",
        // Mobile slide in/out
        isOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:translate-x-0",
        // Mobile max width
        "max-w-[85vw] sm:max-w-72"
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <div className="h-4 w-4 rounded bg-white" />
              </div>
              <span className="text-lg font-semibold">TrackNow</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
              title="Close menu"
            >
              <Icon icon={X} size="md" />
            </Button>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between p-3 xl:p-4">
            {!collapsed && (
              <span className="text-sm font-medium text-muted-foreground">Menu</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className={cn("h-8 w-8", collapsed ? "mx-auto" : "ml-auto")}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Icon icon={collapsed ? ChevronRight : ChevronLeft} size="sm" />
            </Button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-2 lg:px-2">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      // Close mobile sidebar when navigating
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-lg transition-all duration-200 relative group text-sm lg:text-base",
                      "hover:bg-muted/60 active:bg-muted/80",
                      isActive && "bg-primary/10 text-primary font-medium shadow-sm",
                      isActive && "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-8 before:bg-gradient-to-b before:from-primary before:to-accent before:rounded-r-full",
                      collapsed && "lg:justify-center"
                    )}
                  >
                    <Icon 
                      icon={item.icon} 
                      size="md"
                      className={cn(
                        "transition-transform duration-200 group-hover:scale-110 flex-shrink-0",
                        collapsed && "lg:mx-auto"
                      )}
                    />
                    <span className={cn(
                      "transition-opacity duration-200",
                      collapsed && "lg:hidden"
                    )}>
                      {item.label}
                    </span>
                    
                    {/* Desktop tooltip for collapsed state */}
                    {collapsed && (
                      <div className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg border border-border">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className={cn(
            "p-3 border-t border-border bg-muted/20",
            collapsed && "lg:p-2"
          )}>
            <div className={cn(
              "text-xs text-muted-foreground text-center",
              collapsed && "lg:hidden"
            )}>
              <p>© 2025 TrackNow</p>
              <p className="mt-1">by Dream Team Services</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};