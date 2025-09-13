import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/atoms/Icon';

interface EnhancedStatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    period: string;
  };
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
  loading?: boolean;
}

export const EnhancedStatsCard: React.FC<EnhancedStatsCardProps> = ({
  title,
  value,
  change,
  icon,
  variant = 'default',
  className,
  loading = false
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return `₹${val.toLocaleString('en-IN')}`;
    }
    return val;
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      case 'neutral': return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      case 'neutral': return '→';
    }
  };

  if (loading) {
    return (
      <div className={cn(
        "card-enhanced p-6 space-y-4 animate-pulse",
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  return (
    <div className={cn(
      "card-enhanced p-6 space-y-4 group gpu-accelerated",
      variant === 'primary' && "card-gradient-primary",
      variant === 'success' && "card-gradient-success", 
      variant === 'warning' && "card-gradient-warning",
      variant === 'danger' && "card-gradient-danger",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={cn(
          "text-sm font-medium",
          variant === 'default' ? "text-muted-foreground" : "text-white/80"
        )}>
          {title}
        </h3>
        <div className={cn(
          "p-2 rounded-lg transition-transform duration-200 group-hover:scale-110",
          variant === 'default' ? "bg-primary/10" : "bg-white/20"
        )}>
          <Icon 
            icon={icon} 
            size="sm" 
            className={cn(
              variant === 'default' ? "text-primary" : "text-white"
            )}
          />
        </div>
      </div>

      {/* Value */}
      <div className="space-y-1">
        <p className={cn(
          "text-2xl sm:text-3xl font-bold tracking-tight",
          variant === 'default' ? "text-foreground" : "text-white"
        )}>
          {formatValue(value)}
        </p>
        
        {/* Change Indicator */}
        {change && (
          <div className="flex items-center gap-1 text-sm">
            <span className={getTrendColor(change.trend)}>
              {getTrendIcon(change.trend)}
            </span>
            <span className={cn(
              "font-medium",
              variant === 'default' ? getTrendColor(change.trend) : "text-white/80"
            )}>
              {Math.abs(change.value)}%
            </span>
            <span className={cn(
              "text-xs",
              variant === 'default' ? "text-muted-foreground" : "text-white/60"
            )}>
              {change.period}
            </span>
          </div>
        )}
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl" />
    </div>
  );
};
