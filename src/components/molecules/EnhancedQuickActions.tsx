import React, { useState } from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  FileText, 
  Target,
  Zap,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/atoms/Icon';
import { Button } from '@/components/atoms/Button';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  hoverColor: string;
  onClick: () => void;
  badge?: string;
  disabled?: boolean;
}

interface EnhancedQuickActionsProps {
  className?: string;
  onAddIncome?: () => void;
  onAddExpense?: () => void;
  onViewReports?: () => void;
  onSetBudget?: () => void;
  onViewCategories?: () => void;
  onCreateGoal?: () => void;
}

export const EnhancedQuickActions: React.FC<EnhancedQuickActionsProps> = ({
  className,
  onAddIncome = () => {},
  onAddExpense = () => {},
  onViewReports = () => {},
  onSetBudget = () => {},
  onViewCategories = () => {},
  onCreateGoal = () => {}
}) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'add-income',
      title: 'Add Income',
      subtitle: 'Record new income',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hoverColor: 'hover:bg-emerald-100',
      onClick: onAddIncome,
      badge: 'Quick'
    },
    {
      id: 'add-expense',
      title: 'Add Expense',
      subtitle: 'Track spending',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
      onClick: onAddExpense,
      badge: 'Quick'
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      subtitle: 'Financial insights',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      onClick: onViewReports
    },
    {
      id: 'set-budget',
      title: 'Set Budget',
      subtitle: 'Plan your spending',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      onClick: onSetBudget
    },
    {
      id: 'view-categories',
      title: 'Categories',
      subtitle: 'Manage categories',
      icon: PieChart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      onClick: onViewCategories
    },
    {
      id: 'create-goal',
      title: 'Set Goal',
      subtitle: 'Financial targets',
      icon: Zap,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100',
      onClick: onCreateGoal,
      badge: 'New'
    }
  ];

  return (
    <div className={cn("card-enhanced p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">Frequently used features</p>
        </div>
        <Button variant="ghost" size="sm" className="opacity-60 hover:opacity-100">
          <Icon icon={Plus} size="sm" />
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          const isHovered = hoveredAction === action.id;
          
          return (
            <div
              key={action.id}
              className={cn(
                "relative group cursor-pointer transition-all duration-300 ease-out",
                "p-4 rounded-xl border border-gray-100",
                action.bgColor,
                action.hoverColor,
                "hover:shadow-lg hover:scale-105 hover:-translate-y-1",
                "active:scale-95 active:translate-y-0",
                action.disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={!action.disabled ? action.onClick : undefined}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
            >
              {/* Badge */}
              {action.badge && (
                <div className="absolute -top-2 -right-2 z-10">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 shadow-sm">
                    {action.badge}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-all duration-300",
                action.color,
                "bg-white shadow-sm",
                isHovered && "shadow-md scale-110"
              )}>
                <IconComponent className="w-6 h-6" />
              </div>

              {/* Content */}
              <div className="space-y-1">
                <h4 className={cn(
                  "font-medium text-sm transition-colors duration-200",
                  isHovered && action.color
                )}>
                  {action.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {action.subtitle}
                </p>
              </div>

              {/* Hover Arrow */}
              <div className={cn(
                "absolute top-4 right-4 transition-all duration-300",
                isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
              )}>
                <ArrowRight className={cn("w-4 h-4", action.color)} />
              </div>

              {/* Ripple Effect */}
              <div className={cn(
                "absolute inset-0 rounded-xl transition-opacity duration-300",
                "bg-gradient-to-r from-transparent via-white to-transparent",
                "opacity-0 group-active:opacity-20"
              )} />
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Need help? Check our guides</span>
          <Button variant="ghost" size="sm" className="text-xs">
            Learn more
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
