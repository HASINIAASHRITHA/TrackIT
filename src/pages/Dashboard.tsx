import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Plane, 
  UtensilsCrossed, 
  Zap, 
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AddTransactionModal } from '@/components/organisms/AddTransactionModal';
import { useTransactions, useCategories, useFinancialSummary } from '@/hooks/useFirebaseData';
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/contexts/AuthContext';
import { Category, createProfileIfNotExists } from '@/lib/firebase';
import { Card } from '@/components/ui/card';

// Mock data for demonstration
const personalCategories: Category[] = [
  { id: '1', title: 'Travel', color: '#3B82F6', icon: 'Plane', budgetMonthly: 20000 },
  { id: '2', title: 'Food', color: '#FF9800', icon: 'Utensils', budgetMonthly: 15000 },
  { id: '3', title: 'Utilities', color: '#FF7043', icon: 'Zap', budgetMonthly: 5000 },
  { id: '4', title: 'Shopping', color: '#8B5CF6', icon: 'ShoppingBag', budgetMonthly: 7000 },
];

const businessCategories: Category[] = [
  { id: '1', title: 'Marketing', color: '#8B5CF6', icon: 'TrendingUp', budgetMonthly: 30000 },
  { id: '2', title: 'Operations', color: '#FF9800', icon: 'Settings', budgetMonthly: 50000 },
  { id: '3', title: 'Salaries', color: '#3B82F6', icon: 'Users', budgetMonthly: 200000 },
  { id: '4', title: 'Office Rent', color: '#10B981', icon: 'Building', budgetMonthly: 45000 },
];

export const Dashboard: React.FC = () => {
  const { user, userData, profileType } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  
  // Initialize profile if needed
  useEffect(() => {
    if (user && profileType) {
      createProfileIfNotExists(user.uid, profileType).catch(console.error);
    }
  }, [user, profileType]);
  
  // Fetch real data from Firebase
  const { transactions } = useTransactions(user?.uid, profileType);
  const { categories } = useCategories(user?.uid, profileType);
  const summary = useFinancialSummary(transactions);
  
  // Use real data or fallback to mock data for display
  const displayCategories = categories.length > 0 ? categories : (profileType === 'business' ? businessCategories : personalCategories);

  // Profile-specific recent transactions
  const recentTransactions = profileType === 'business' ? [
    { id: '1', date: '12 Sep', description: 'Facebook Ads Campaign', category: 'Marketing', amount: 15000, type: 'expense' },
    { id: '2', date: '10 Sep', description: 'Employee Salary - John', category: 'Salaries', amount: 45000, type: 'expense' },
    { id: '3', date: '9 Sep', description: 'Office Electricity Bill', category: 'Operations', amount: 3500, type: 'expense' },
    { id: '4', date: '8 Sep', description: 'Client Payment - ABC Corp', category: 'Revenue', amount: 125000, type: 'income' },
  ] : [
    { id: '1', date: '12 Sep', description: 'Uber Ride', category: 'Travel', amount: 450, type: 'expense' },
    { id: '2', date: '10 Sep', description: 'Lunch at Restaurant', category: 'Food', amount: 1200, type: 'expense' },
    { id: '3', date: '9 Sep', description: 'Electricity Bill', category: 'Utilities', amount: 1500, type: 'expense' },
    { id: '4', date: '8 Sep', description: 'Freelance Income', category: 'Income', amount: 25000, type: 'income' },
  ];

  // Profile-specific financial data
  const profileData = profileType === 'business' ? {
    totalBalance: 850000,
    income: 450000,
    expenses: 280000,
    categories: [
      { name: 'Marketing', spent: 45000, budget: 60000, color: 'bg-purple-500', icon: TrendingUp },
      { name: 'Operations', spent: 35000, budget: 50000, color: 'bg-orange-500', icon: Zap },
      { name: 'Salaries', spent: 180000, budget: 200000, color: 'bg-blue-500', icon: TrendingUp },
      { name: 'Office Rent', spent: 45000, budget: 45000, color: 'bg-green-500', icon: TrendingUp },
    ]
  } : {
    totalBalance: 125000,
    income: 80000,
    expenses: 45000,
    categories: [
      { name: 'Travel', spent: 20000, budget: 30000, color: 'bg-blue-500', icon: Plane },
      { name: 'Food', spent: 15000, budget: 25000, color: 'bg-orange-500', icon: UtensilsCrossed },
      { name: 'Utilities', spent: 5000, budget: 8000, color: 'bg-yellow-500', icon: Zap },
      { name: 'Shopping', spent: 5000, budget: 12000, color: 'bg-purple-500', icon: TrendingUp },
    ]
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {profileType === 'business' 
              ? `Welcome to ${userData?.displayName?.split(' ')[0] || 'Your'} Business Dashboard 💼`
              : `Hello, ${userData?.displayName?.split(' ')[0] || 'Hasini'} 👋 — Welcome Back`
            }
          </h2>
          <p className="text-gray-600 mt-1">
            {profileType === 'business' 
              ? 'Monitor your business expenses, revenue, and team performance'
              : 'Track your personal expenses and manage your budget'
            }
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          <Plus size={20} className="mr-2" />
          {profileType === 'business' ? 'Add Business Expense' : 'Add Personal Expense'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Welcome and Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance and Income/Expenses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Balance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {profileType === 'business' ? 'Business Balance' : 'Total Balance'}
              </h3>
              <p className="text-4xl font-bold text-gray-900 mb-4">
                ₹{profileData.totalBalance.toLocaleString('en-IN')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    {profileType === 'business' ? 'Revenue' : 'Income'}
                  </p>
                  <p className="text-xl font-semibold text-green-600">
                    ₹{profileData.income.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expenses</p>
                  <p className="text-xl font-semibold text-red-600">
                    ₹{profileData.expenses.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </Card>

            {/* Expenses Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses</h3>
              <div className="flex items-center justify-center h-32">
                {/* Simple pie chart representation */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 via-orange-500 to-purple-500"></div>
              </div>
              <div className="mt-4 flex justify-center space-x-4 text-xs">
                <span className="text-gray-600">Jan</span>
                <span className="text-gray-600">Feb</span>
                <span className="text-gray-600">Mar</span>
                <span className="text-gray-600">Apr</span>
                <span className="text-gray-600">May</span>
              </div>
            </Card>
          </div>

          {/* Expense Categories */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {profileType === 'business' ? 'Business Categories' : 'Expense Categories'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {profileData.categories.map((category, index) => {
                const IconComponent = category.icon;
                const progressPercentage = (category.spent / category.budget) * 100;
                
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center`}>
                      <IconComponent size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{category.name}</h4>
                      <p className="text-sm text-gray-600">Spent this month</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{category.spent.toLocaleString('en-IN')}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`${category.color} h-2 rounded-full transition-all duration-300`} 
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Budget: ₹{category.budget.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column - Recent Transactions */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {profileType === 'business' ? 'Business Transactions' : 'Recent Transactions'}
            </h3>
            <div className="space-y-1">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600 pb-2 border-b">
                <span>Date</span>
                <span>Description</span>
                <span>Category</span>
                <span className="text-right">Amount</span>
              </div>
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="grid grid-cols-4 gap-4 py-3 text-sm">
                  <span className="text-gray-600">{transaction.date}</span>
                  <span className="text-gray-900 truncate">{transaction.description}</span>
                  <span className="text-gray-600">{transaction.category}</span>
                  <span className={`text-right font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : ''}₹{transaction.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
            {profileType === 'business' && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Revenue Target</span>
                  <span className="font-medium text-green-600">₹500,000</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Achieved This Month</span>
                  <span className="font-medium text-blue-600">₹{profileData.income.toLocaleString('en-IN')} (90%)</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        profileId={profileType}
        categories={displayCategories.map(cat => ({
          id: cat.id!,
          title: cat.title,
          color: cat.color,
          icon: cat.icon
        }))}
        onSuccess={() => {
          // Refresh data or handle success
          setShowAddModal(false);
        }}
      />
    </div>
  );
};