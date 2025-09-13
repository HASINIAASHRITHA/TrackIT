import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, TrendingUp, Calendar, Settings } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions, useCategories } from '@/hooks/useFirebaseData';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'budget_alert' | 'milestone' | 'reminder' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, profileType } = useAuth();
  const { transactions } = useTransactions(user?.uid, profileType);
  const { categories } = useCategories(user?.uid, profileType);

  // Generate notifications based on user data
  useEffect(() => {
    if (!transactions.length || !categories.length) return;

    const generatedNotifications: Notification[] = [];

    // Budget alerts
    categories.forEach(category => {
      if (!category.budgetMonthly || category.budgetMonthly <= 0) return;

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const categoryExpenses = transactions
        .filter(t => 
          t.type === 'expense' && 
          t.categoryId === category.id &&
          t.date?.toDate?.().getMonth() === currentMonth &&
          t.date?.toDate?.().getFullYear() === currentYear
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const budgetUsage = (categoryExpenses / category.budgetMonthly) * 100;

      if (budgetUsage >= 90) {
        generatedNotifications.push({
          id: `budget-alert-${category.id}`,
          type: 'budget_alert',
          title: 'Budget Alert',
          message: `You've spent ${budgetUsage.toFixed(0)}% of your ${category.title} budget this month`,
          timestamp: new Date(),
          read: false,
          priority: budgetUsage >= 100 ? 'high' : 'medium'
        });
      } else if (budgetUsage >= 75) {
        generatedNotifications.push({
          id: `budget-warning-${category.id}`,
          type: 'budget_alert',
          title: 'Budget Warning',
          message: `You've used ${budgetUsage.toFixed(0)}% of your ${category.title} budget`,
          timestamp: new Date(),
          read: false,
          priority: 'low'
        });
      }
    });

    // Milestone notifications
    const totalSpentThisMonth = transactions
      .filter(t => {
        const date = t.date?.toDate?.() || new Date();
        return t.type === 'expense' && 
               date.getMonth() === new Date().getMonth() &&
               date.getFullYear() === new Date().getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalSpentThisMonth > 0) {
      if (totalSpentThisMonth >= 100000) {
        generatedNotifications.push({
          id: 'milestone-100k',
          type: 'milestone',
          title: 'Spending Milestone',
          message: `You've spent over ₹1,00,000 this month. Consider reviewing your expenses.`,
          timestamp: new Date(),
          read: false,
          priority: 'medium'
        });
      } else if (totalSpentThisMonth >= 50000) {
        generatedNotifications.push({
          id: 'milestone-50k',
          type: 'milestone',
          title: 'Monthly Update',
          message: `You've spent ₹${totalSpentThisMonth.toLocaleString('en-IN')} this month so far.`,
          timestamp: new Date(),
          read: false,
          priority: 'low'
        });
      }
    }

    // System notifications
    if (transactions.length === 0) {
      generatedNotifications.push({
        id: 'welcome',
        type: 'system',
        title: 'Welcome to Expense Manager!',
        message: 'Start by adding your first transaction to begin tracking your finances.',
        timestamp: new Date(),
        read: false,
        priority: 'low'
      });
    }

    setNotifications(generatedNotifications);
    setUnreadCount(generatedNotifications.filter(n => !n.read).length);
  }, [transactions, categories]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: Notification['type'], priority: Notification['priority']) => {
    switch (type) {
      case 'budget_alert':
        return priority === 'high' ? AlertTriangle : TrendingUp;
      case 'milestone':
        return TrendingUp;
      case 'reminder':
        return Calendar;
      case 'system':
        return Settings;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-8 w-8 sm:h-10 sm:w-10"
          title="Notifications"
        >
          <Icon icon={Bell} size="md" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 text-[10px] sm:text-xs flex items-center justify-center min-w-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-72 sm:w-80 p-0 max-w-[90vw]"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
          <h3 className="font-semibold text-sm sm:text-base">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-auto p-1 hover:bg-muted"
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-80 sm:h-96">
          {notifications.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-muted-foreground">
              <Icon icon={Bell} size="lg" className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No new notifications</p>
              <p className="text-xs mt-1">We'll notify you about important updates</p>
            </div>
          ) : (
            <div className="p-1 sm:p-2">
              {notifications
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg mb-1 sm:mb-2 transition-colors hover:bg-muted/50",
                      !notification.read && "bg-primary/5 border border-primary/10"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "p-1.5 sm:p-2 rounded-lg mt-0.5 flex-shrink-0",
                      notification.priority === 'high' ? 'bg-destructive/10' :
                      notification.priority === 'medium' ? 'bg-warning/10' : 'bg-muted/50'
                    )}>
                      <Icon 
                        icon={getNotificationIcon(notification.type, notification.priority)} 
                        size="sm" 
                        className={getPriorityColor(notification.priority)}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1 sm:gap-2">
                        <h4 className="text-xs sm:text-sm font-medium leading-tight pr-1">
                          {notification.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearNotification(notification.id)}
                          className="h-5 w-5 sm:h-6 sm:w-6 p-0 opacity-60 hover:opacity-100 flex-shrink-0"
                        >
                          <Icon icon={X} size="xs" />
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs h-5 sm:h-6 px-1 sm:px-2"
                          >
                            <Icon icon={Check} size="xs" className="mr-1" />
                            <span className="hidden sm:inline">Mark read</span>
                            <span className="sm:hidden">Read</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};