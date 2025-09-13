import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, TrendingUp, TrendingDown, Calendar, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/atoms/Icon';
import { Button } from '@/components/atoms/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  categoryColor?: string;
}

interface EnhancedTransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
  showActions?: boolean;
  maxItems?: number;
}

export const EnhancedTransactionList: React.FC<EnhancedTransactionListProps> = ({
  transactions,
  loading = false,
  onEdit,
  onDelete,
  showActions = true,
  maxItems
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const displayTransactions = maxItems 
    ? transactions.slice(0, maxItems) 
    : transactions;

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card-enhanced p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="card-enhanced p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted/20 rounded-full flex items-center justify-center">
          <Icon icon={TrendingUp} size="lg" className="text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground mb-2">No transactions yet</h3>
        <p className="text-sm text-muted-foreground">
          Start by adding your first transaction to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayTransactions.map((transaction, index) => (
        <div
          key={transaction.id}
          className={cn(
            "card-enhanced p-4 transition-all duration-200 cursor-pointer group",
            "hover:shadow-md hover:scale-[1.01]",
            hoveredId === transaction.id && "ring-2 ring-primary/20"
          )}
          onMouseEnter={() => setHoveredId(transaction.id)}
          onMouseLeave={() => setHoveredId(null)}
          style={{
            animationDelay: `${index * 50}ms`
          }}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Transaction Icon & Details */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Icon */}
              <div className={cn(
                "p-2.5 rounded-xl transition-all duration-200 group-hover:scale-110",
                transaction.type === 'income' 
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              )}>
                <Icon 
                  icon={transaction.type === 'income' ? TrendingUp : TrendingDown} 
                  size="sm" 
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">
                    {transaction.description}
                  </h4>
                  <Badge 
                    variant="outline" 
                    className="text-xs px-2 py-0 hidden sm:inline-flex"
                    style={{ 
                      borderColor: transaction.categoryColor || '#666',
                      color: transaction.categoryColor || '#666'
                    }}
                  >
                    <Icon icon={Tag} size="xs" className="mr-1" />
                    {transaction.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon icon={Calendar} size="xs" />
                  {transaction.date}
                  <span className="sm:hidden">• {transaction.category}</span>
                </div>
              </div>
            </div>

            {/* Amount & Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Amount */}
              <div className="text-right">
                <p className={cn(
                  "font-semibold text-sm sm:text-base",
                  transaction.type === 'income' 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                )}>
                  {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Actions */}
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon icon={MoreHorizontal} size="sm" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => onEdit?.(transaction)}
                      className="cursor-pointer"
                    >
                      <Icon icon={Edit} size="sm" className="mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(transaction.id)}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <Icon icon={Trash2} size="sm" className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Progress bar for large amounts */}
          {transaction.amount > 10000 && (
            <div className="mt-3 h-1 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-1000 rounded-full",
                  transaction.type === 'income' ? "bg-green-400" : "bg-red-400"
                )}
                style={{
                  width: `${Math.min((transaction.amount / 50000) * 100, 100)}%`,
                  animationDelay: `${index * 100}ms`
                }}
              />
            </div>
          )}
        </div>
      ))}

      {maxItems && transactions.length > maxItems && (
        <div className="text-center pt-4">
          <Button variant="outline" size="sm" className="btn-enhanced">
            View {transactions.length - maxItems} more transactions
          </Button>
        </div>
      )}
    </div>
  );
};
