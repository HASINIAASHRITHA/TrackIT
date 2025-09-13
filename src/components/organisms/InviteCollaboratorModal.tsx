import React, { useState } from 'react';
import { AtSign, Search, UserPlus, X, Check } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { getUserByUsername, addCollaborator } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InviteCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  onSuccess?: () => void;
}

export const InviteCollaboratorModal: React.FC<InviteCollaboratorModalProps> = ({
  isOpen,
  onClose,
  profileId,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [foundUser, setFoundUser] = useState<{ uid: string; username: string } | null>(null);

  const handleSearch = async () => {
    if (!username.trim()) return;

    setSearching(true);
    setFoundUser(null);

    try {
      const uid = await getUserByUsername(username);
      if (uid) {
        if (uid === user?.uid) {
          toast({
            title: 'Invalid username',
            description: "You can't invite yourself as a collaborator.",
            variant: 'destructive',
          });
        } else {
          setFoundUser({ uid, username });
          toast({
            title: 'User found',
            description: `@${username} is available to invite.`,
          });
        }
      } else {
        toast({
          title: 'User not found',
          description: `No user found with username @${username}.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'Failed to search for user.',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async () => {
    if (!foundUser || !user) return;

    setLoading(true);
    
    try {
      await addCollaborator(user.uid, profileId, foundUser.uid, role);
      
      toast({
        title: 'Collaborator invited',
        description: `@${foundUser.username} has been added as a ${role}.`,
      });
      
      onSuccess?.();
      onClose();
      
      // Reset form
      setUsername('');
      setFoundUser(null);
      setRole('viewer');
    } catch (error: any) {
      toast({
        title: 'Invitation failed',
        description: error.message || 'Failed to add collaborator.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const roleDescriptions = {
    viewer: 'Can view transactions and reports',
    editor: 'Can create, edit, and delete transactions',
    admin: 'Full access including managing collaborators',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Collaborator</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Username Search */}
          <div>
            <label className="text-sm font-medium mb-2 block">Search by Username</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Icon
                  icon={AtSign}
                  size="sm"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-base"
                  placeholder="Enter username"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!username.trim() || searching}
                variant="outline"
                size="icon"
              >
                {searching ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Icon icon={Search} size="sm" />
                )}
              </Button>
            </div>
          </div>

          {/* Found User */}
          {foundUser && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Icon icon={UserPlus} size="sm" className="text-success" />
                </div>
                <div>
                  <p className="font-medium">@{foundUser.username}</p>
                  <p className="text-xs text-muted-foreground">Ready to invite</p>
                </div>
              </div>
              <Icon icon={Check} size="sm" className="text-success" />
            </div>
          )}

          {/* Role Selection */}
          {foundUser && (
            <div className="animate-fade-in">
              <label className="text-sm font-medium mb-2 block">Select Role</label>
              <Select value={role} onValueChange={(value: any) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <div>
                      <p className="font-medium">Viewer</p>
                      <p className="text-xs text-muted-foreground">View only access</p>
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div>
                      <p className="font-medium">Editor</p>
                      <p className="text-xs text-muted-foreground">Can manage transactions</p>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div>
                      <p className="font-medium">Admin</p>
                      <p className="text-xs text-muted-foreground">Full access</p>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <div className="mt-2 p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  {roleDescriptions[role]}
                </p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">How collaboration works</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Collaborators can access your business profile</li>
              <li>• They'll see real-time updates to transactions</li>
              <li>• You can manage permissions anytime</li>
              <li>• All actions are logged for security</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleInvite}
              disabled={!foundUser || loading}
              loading={loading}
              className="flex-1"
            >
              Send Invite
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};