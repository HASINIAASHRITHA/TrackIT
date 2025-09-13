import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { addCategory, updateCategory, deleteCategory, createProfileIfNotExists, db } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { collection, onSnapshot } from "firebase/firestore";

export const Categories: React.FC = () => {
  useEffect(() => {
    document.title = "Categories | Expense Manager";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Create and manage your expense categories");
  }, []);

  const { profileType, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; title: string; color: string; icon: string; type?: 'expense' | 'income'; budgetMonthly?: number }>>([]);

  useEffect(() => {
    if (!user) return;
    
    const initializeProfile = async () => {
      await createProfileIfNotExists(user.uid, profileType);
      
      const colRef = collection(db, 'users', user.uid, 'profiles', profileType, 'categories');
      const unsub = onSnapshot(colRef, (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setCategories(data);
      });
      return unsub;
    };
    
    let unsubscribe: () => void;
    initializeProfile().then((unsub) => {
      if (unsub) unsubscribe = unsub;
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, profileType]);

  const defaultCategories = profileType === 'business'
    ? ["Marketing", "Operations", "Salaries", "Office Rent"]
    : ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Others"];

  const handleAdd = async () => {
    if (!user || !title.trim()) return;
    setSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(user.uid, profileType, editingCategory.id, {
          title: title.trim(),
        });
      } else {
        await addCategory(user.uid, profileType, {
          title: title.trim(),
          color: "#3B82F6",
          icon: "TrendingUp",
          type: 'expense',
          budgetMonthly: 0,
        });
      }
      setOpen(false);
      setTitle("");
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setTitle(category.title);
    setOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!user || !confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(user.uid, profileType, categoryId);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setEditingCategory(null);
    setOpen(false);
  };

  return (
    <div>
      <header className="flex items-center justify-between gap-3 pb-6 border-b">
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <Button className="btn-gradient" onClick={() => setOpen(true)}><Icon icon={Plus} size="sm" className="mr-2"/>New Category</Button>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-6">
        {(categories.length > 0 ? categories.map((cat) => (
          <Card key={cat.id} className="card-hover">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{cat.title}</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)} aria-label={`Edit ${cat.title}`}>
                  <Icon icon={Pencil} size="sm"/>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} aria-label={`Delete ${cat.title}`} className="text-red-600 hover:text-red-700">
                  <Icon icon={Trash2} size="sm"/>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No limits set. Track your {String(cat.title).toLowerCase()} spending here.</p>
            </CardContent>
          </Card>
        )) : (
          defaultCategories.map((cat) => (
            <Card key={cat} className="card-hover">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{cat}</CardTitle>
                <Button variant="ghost" size="icon" aria-label={`Edit ${cat}`}>
                  <Icon icon={Pencil} size="sm"/>
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No limits set. Track your {cat.toLowerCase()} spending here.</p>
              </CardContent>
            </Card>
          ))
        ))}
      </main>

      <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>Set a name for your {editingCategory ? 'updated' : 'new'} category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Subscriptions"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button variant="gradient" onClick={handleAdd} loading={saving}>
                {editingCategory ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
