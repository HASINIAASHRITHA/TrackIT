import React, { useState } from 'react';
import { X, Upload, Calendar, IndianRupee, FileText, Tag } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { addTransaction } from '@/lib/firebase';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: 'personal' | 'business';
  categories: Array<{ id: string; title: string; color: string; icon: string }>;
  onSuccess?: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  profileId,
  categories,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const getISTDate = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const y = parts.find(p => p.type === 'year')!.value;
    const m = parts.find(p => p.type === 'month')!.value;
    const d = parts.find(p => p.type === 'day')!.value;
    return `${y}-${m}-${d}`;
  };
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'expense' | 'income',
    categoryId: '',
    description: '',
    date: getISTDate(),
    tags: '',
    project: '',
    client: '',
  });
  
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<Array<{ url: string; public_id?: string }>>([]);

  // Test function to auto-fill form for debugging
  const fillTestData = () => {
    console.log('🧪 Filling test data...');
    console.log('Available categories:', categories);
    const firstCategory = categories[0];
    if (firstCategory) {
      setFormData({
        amount: '1000',
        type: 'expense',
        categoryId: firstCategory.id,
        description: 'Test transaction',
        date: getISTDate(),
        tags: '',
        project: '',
        client: '',
      });
      console.log('✅ Test data filled with category:', firstCategory);
    } else {
      console.log('❌ No categories available for test');
    }
  };

  // Test Firebase connectivity
  const testFirebaseConnection = async () => {
    console.log('🔥 Testing Firebase connection...');
    try {
      if (!user) {
        console.log('❌ No user authenticated');
        return;
      }

      console.log('👤 Current user:', { uid: user.uid, email: user.email });
      console.log('📋 Profile ID:', profileId);
      
      // Test if we can read from Firestore
      const { db, COLLECTIONS } = await import('@/lib/firebase');
      const { doc, getDoc } = await import('firebase/firestore');
      
      const userRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userRef);
      
      console.log('📄 User document exists:', userDoc.exists());
      if (userDoc.exists()) {
        console.log('📄 User data:', userDoc.data());
      }

      // Test profile access
      const profileRef = doc(db, COLLECTIONS.USERS, user.uid, COLLECTIONS.PROFILES, profileId);
      const profileDoc = await getDoc(profileRef);
      
      console.log('👤 Profile document exists:', profileDoc.exists());
      if (profileDoc.exists()) {
        console.log('👤 Profile data:', profileDoc.data());
      }

      toast({
        title: 'Firebase Test',
        description: 'Check console for connection details',
      });
    } catch (error) {
      console.error('🚨 Firebase connection error:', error);
      toast({
        title: 'Firebase Test Failed',
        description: `Error: ${(error as Error).message}`,
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleUpload = async () => {
    const urls = [];
    for (let i = 0; i < attachments.length; i++) {
      try {
        const response = await uploadToCloudinary(attachments[i], (progress) => {
          setUploadProgress(Math.round(((i + progress / 100) / attachments.length) * 100));
        });
        urls.push({
          url: response.secure_url,
          public_id: response.public_id,
        });
      } catch (error) {
        console.error('Upload failed:', error);
        toast({
          title: 'Upload failed',
          description: `Failed to upload ${attachments[i].name}`,
          variant: 'destructive',
        });
      }
    }
    setUploadedUrls(urls);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== FORM SUBMISSION START ===');
    console.log('User:', user);
    console.log('Profile ID:', profileId);
    console.log('Form Data:', formData);
    console.log('Categories prop:', categories);
    
    if (!user) {
      console.log('❌ No user - aborting');
      return;
    }

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      console.log('❌ Invalid amount:', formData.amount);
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.categoryId) {
      console.log('❌ No category selected');
      console.log('Available categories:', categories);
      toast({
        title: 'Category required',
        description: 'Please select a category for this transaction.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.description.trim()) {
      console.log('❌ No description provided');
      toast({
        title: 'Description required',
        description: 'Please enter a description for this transaction.',
        variant: 'destructive',
      });
      return;
    }

    console.log('✅ All validations passed, setting loading');
    setLoading(true);
    
    try {
      // Upload attachments if any
      if (attachments.length > 0 && uploadedUrls.length === 0) {
        console.log('📎 Uploading attachments...');
        await handleUpload();
      }

      // Create metadata object, filtering out empty values
      const metadata: any = {
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0) : [],
      };
      
      // Only add project and client if they have actual values
      if (formData.project && formData.project.trim()) {
        metadata.project = formData.project.trim();
      }
      
      if (formData.client && formData.client.trim()) {
        metadata.client = formData.client.trim();
      }

      const transaction = {
        amount: parseFloat(formData.amount),
        currency: 'INR',
        type: formData.type,
        categoryId: formData.categoryId,
        description: formData.description.trim(),
        date: null as any, // Will be set by serverTimestamp
        createdBy: user.uid,
        attachments: uploadedUrls.map(url => ({
          ...url,
          provider: 'cloudinary' as const,
        })),
        metadata,
      };

      console.log('📤 Submitting transaction to Firebase:', transaction);
      console.log('👤 User ID:', user.uid);
      console.log('📋 Profile ID:', profileId);
      
      const result = await addTransaction(user.uid, profileId, transaction);
      console.log('✅ Firebase result:', result);
      
      toast({
        title: 'Transaction added',
        description: 'Your transaction has been recorded successfully.',
      });
      
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        amount: '',
        type: 'expense',
        categoryId: '',
        description: '',
        date: getISTDate(),
        tags: '',
        project: '',
        client: '',
      });
      setAttachments([]);
      setUploadedUrls([]);
    } catch (error: any) {
      console.error('🚨 TRANSACTION ERROR DETAILS:');
      console.error('Error object:', error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Error stack:', error?.stack);
      
      if (error?.code) {
        console.error('Firebase error code:', error.code);
      }
      
      toast({
        title: 'Failed to add transaction',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      console.log('🏁 Form submission completed, setting loading to false');
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass max-w-lg">
        <DialogHeader>
          <DialogTitle>Add {formData.type === 'income' ? 'Income' : 'Expense'}</DialogTitle>
          <DialogDescription>Record a {formData.type} in INR. Attach receipts if needed.</DialogDescription>
          <div className="flex gap-2">
            <Button type="button" onClick={fillTestData} size="sm" variant="outline">
              🧪 Fill Test Data
            </Button>
            <Button type="button" onClick={testFirebaseConnection} size="sm" variant="outline">
              🔥 Test Firebase
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={formData.type === 'expense' ? 'gradient' : 'outline'}
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
              className="flex-1"
            >
              Expense
            </Button>
            <Button
              type="button"
              variant={formData.type === 'income' ? 'gradient' : 'outline'}
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
              className="flex-1"
            >
              Income
            </Button>
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium mb-2 block">Amount</label>
            <div className="relative">
              <Icon
                icon={IndianRupee}
                size="sm"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full h-10 pl-10 pr-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-base"
                placeholder="Enter amount"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <div className="relative">
              <Icon
                icon={FileText}
                size="sm"
                className="absolute left-3 top-3 text-muted-foreground"
              />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full min-h-[80px] pl-10 pr-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-base resize-none"
                placeholder="Enter description"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-medium mb-2 block">Date</label>
            <div className="relative">
              <Icon
                icon={Calendar}
                size="sm"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full h-10 pl-10 pr-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-base"
                required
              />
            </div>
          </div>

          {/* Tags (Optional) */}
          {profileId === 'business' && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Tags (Optional)</label>
                <div className="relative">
                  <Icon
                    icon={Tag}
                    size="sm"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full h-10 pl-10 pr-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-base"
                    placeholder="marketing, Q4, campaign (comma separated)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Project (Optional)</label>
                  <input
                    type="text"
                    value={formData.project}
                    onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-base"
                    placeholder="Project name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Client (Optional)</label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-base"
                    placeholder="Client name"
                  />
                </div>
              </div>
            </>
          )}

          {/* Attachments */}
          <div>
            <label className="text-sm font-medium mb-2 block">Attachments (Optional)</label>
            <div className="space-y-2">
              <label className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-dashed border-input bg-background hover:bg-muted/50 cursor-pointer transition-colors">
                <Icon icon={Upload} size="sm" />
                <span className="text-sm">Choose files</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              
              {attachments.length > 0 && (
                <div className="space-y-1">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                      <span className="truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Icon icon={X} size="xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {uploadProgress > 0 && (
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-theme-gradient h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              loading={loading}
              className="flex-1"
            >
              Add {formData.type === 'income' ? 'Income' : 'Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};