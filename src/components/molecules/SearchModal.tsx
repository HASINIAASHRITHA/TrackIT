import React, { useState, useEffect } from 'react';
import { Search, X, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions, useCategories } from '@/hooks/useFirebaseData';
import { cn } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, profileType } = useAuth();
  const { transactions } = useTransactions(user?.uid, profileType);
  const { categories } = useCategories(user?.uid, profileType);
  
  const [filteredResults, setFilteredResults] = useState<{
    transactions: any[];
    categories: any[];
  }>({
    transactions: [],
    categories: []
  });

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResults({ transactions: [], categories: [] });
      return;
    }

    const query = searchQuery.toLowerCase();

    const filteredTransactions = transactions
      .filter(transaction => 
        transaction.description.toLowerCase().includes(query) ||
        categories.find(cat => cat.id === transaction.categoryId)?.title.toLowerCase().includes(query)
      )
      .slice(0, 5);

    const filteredCategories = categories
      .filter(category => 
        category.title.toLowerCase().includes(query)
      )
      .slice(0, 3);

    setFilteredResults({
      transactions: filteredTransactions,
      categories: filteredCategories
    });
  }, [searchQuery, transactions, categories]);

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const formatAmount = (amount: number, type: string) => {
    const formattedAmount = `₹${amount.toLocaleString('en-IN')}`;
    return type === 'income' ? `+${formattedAmount}` : `-${formattedAmount}`;
  };

  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date();
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Search Header */}
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-border flex-shrink-0">
          <Icon icon={Search} size="md" className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transactions, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground text-sm sm:text-base"
            autoFocus
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
          >
            <Icon icon={X} size="sm" />
          </Button>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {!searchQuery.trim() ? (
            <div className="p-6 sm:p-8 text-center text-muted-foreground">
              <Icon icon={Search} size="lg" className="mx-auto mb-2 opacity-50" />
              <p className="text-sm sm:text-base">Type to search transactions and categories</p>
            </div>
          ) : (
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {/* Recent Searches */}
              {searchQuery.length < 2 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Icon icon={Clock} size="sm" />
                    Recent searches
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    Start typing to see results...
                  </div>
                </div>
              )}

              {/* Categories */}
              {filteredResults.categories.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Categories</h3>
                  <div className="space-y-1 sm:space-y-2">
                    {filteredResults.categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: category.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{category.title}</p>
                          <p className="text-xs text-muted-foreground">Category</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions */}
              {filteredResults.transactions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Transactions</h3>
                  <div className="space-y-1 sm:space-y-2">
                    {filteredResults.transactions.map((transaction) => {
                      const category = categories.find(cat => cat.id === transaction.categoryId);
                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors gap-2"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className={cn(
                              "p-1.5 sm:p-2 rounded-lg flex-shrink-0",
                              transaction.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'
                            )}>
                              <Icon 
                                icon={transaction.type === 'income' ? TrendingUp : TrendingDown} 
                                size="sm" 
                                className={transaction.type === 'income' ? 'text-success' : 'text-destructive'}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(transaction.date)} • {category?.title || 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <p className={cn(
                            "text-sm font-semibold flex-shrink-0",
                            transaction.type === 'income' ? 'text-success' : 'text-destructive'
                          )}>
                            {formatAmount(transaction.amount, transaction.type)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchQuery.length >= 2 && 
               filteredResults.transactions.length === 0 && 
               filteredResults.categories.length === 0 && (
                <div className="p-6 sm:p-8 text-center text-muted-foreground">
                  <p className="text-sm sm:text-base">No results found for "{searchQuery}"</p>
                  <p className="text-xs sm:text-sm mt-1">Try searching for transaction descriptions or category names</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};