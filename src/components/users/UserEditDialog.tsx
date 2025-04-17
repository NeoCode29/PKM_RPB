import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, UserRole } from '@/services/user-service';

interface UserEditDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: { username?: string; role?: UserRole }) => Promise<void>;
}

export const UserEditDialog: React.FC<UserEditDialogProps> = ({
  user,
  open,
  onOpenChange,
  onSave,
}) => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setRole(user.role);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    const updates: { username?: string; role?: UserRole } = {};
    if (username !== user.username) updates.username = username;
    if (role !== user.role) updates.role = role;

    try {
      setIsSaving(true);
      await onSave(updates);
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving user:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">{role}</Badge>;
      case 'reviewer':
        return <Badge variant="secondary">{role}</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={user?.email || ''}
              className="col-span-3"
              disabled
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select 
              onValueChange={(value) => setRole(value as UserRole)} 
              value={role || ''}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih role">
                  {role && getRoleBadge(role)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    {getRoleBadge('admin')}
                    <span>Admin</span>
                  </div>
                </SelectItem>
                <SelectItem value="reviewer">
                  <div className="flex items-center gap-2">
                    {getRoleBadge('reviewer')}
                    <span>Reviewer</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button type="submit" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 