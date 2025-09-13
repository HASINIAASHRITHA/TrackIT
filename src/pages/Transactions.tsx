import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { Plus, Filter, Upload } from "lucide-react";
import { AddTransactionModal } from "@/components/organisms/AddTransactionModal";
import { useAuth } from "@/contexts/AuthContext";

export const Transactions: React.FC = () => {
  useEffect(() => {
    document.title = "Transactions | Expense Manager";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "View and manage your expense transactions");
  }, []);

  const { profileType } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = (profileType === 'business'
    ? [
        { id: 'marketing', title: 'Marketing', color: '#8B5CF6', icon: 'TrendingUp' },
        { id: 'operations', title: 'Operations', color: '#FF9800', icon: 'Settings' },
        { id: 'salaries', title: 'Salaries', color: '#3B82F6', icon: 'Users' },
        { id: 'rent', title: 'Office Rent', color: '#10B981', icon: 'Building' },
      ]
    : [
        { id: 'travel', title: 'Travel', color: '#3B82F6', icon: 'Plane' },
        { id: 'food', title: 'Food', color: '#FF9800', icon: 'Utensils' },
        { id: 'utilities', title: 'Utilities', color: '#FF7043', icon: 'Zap' },
        { id: 'shopping', title: 'Shopping', color: '#8B5CF6', icon: 'ShoppingBag' },
      ]);

  return (
    <div>
      <header className="flex items-center justify-between gap-3 pb-6 border-b">
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Icon icon={Filter} size="sm" className="mr-2"/>Filter</Button>
          <Button variant="outline"><Icon icon={Upload} size="sm" className="mr-2"/>Export</Button>
          <Button className="btn-gradient" onClick={() => setShowAddModal(true)}><Icon icon={Plus} size="sm" className="mr-2"/>Add Transaction</Button>
        </div>
      </header>

      <main className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-6">
        <section className="xl:col-span-2 space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">No transactions yet. Start by adding your first transaction.</div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 rounded-md bg-muted/40" />
            </CardContent>
          </Card>
        </section>
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between"><span>Total this month</span><span className="font-medium">₹0</span></li>
                <li className="flex justify-between"><span>Income</span><span className="text-success font-medium">₹0</span></li>
                <li className="flex justify-between"><span>Expenses</span><span className="text-destructive font-medium">₹0</span></li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </main>

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        profileId={profileType}
        categories={categories}
        onSuccess={() => setShowAddModal(false)}
      />
    </div>
  );
};

export default Transactions;
