import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  color: string;
  currency?: string;
  budget?: number;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  amount,
  icon: IconComponent,
  color,
  currency = '₹',
  budget,
  onClick
}) => {
  const percentage = budget ? (amount / budget) * 100 : 0;
  const isOverBudget = percentage > 100;
  const isNearBudget = percentage > 80;
  
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass card-hover cursor-pointer rounded-lg p-4",
        "border border-glass-border"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="relative h-12 w-12 rounded-full p-3"
            style={{ background: color }}
          >
            <IconComponent className="h-full w-full text-white" />
            {budget && (
              <svg
                className="absolute -inset-0.5 h-[52px] w-[52px] -rotate-90"
                viewBox="0 0 52 52"
              >
                <circle
                  cx="26"
                  cy="26"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-200/30"
                />
                <circle
                  cx="26"
                  cy="26"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - Math.min(percentage, 100) / 100)}`}
                  className={cn(
                    "transition-all duration-slow",
                    isOverBudget && "text-destructive",
                    isNearBudget && !isOverBudget && "text-warning",
                    !isNearBudget && "text-white"
                  )}
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-lg font-semibold">
              {currency}{amount.toLocaleString()}
            </p>
            {budget && (
              <p className="text-xs text-muted-foreground">
                of {currency}{budget.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};