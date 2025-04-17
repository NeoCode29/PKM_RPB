import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from '@/services/user-service';
import { format } from 'date-fns';

interface UserDetailDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

export const UserDetailDialog: React.FC<UserDetailDialogProps> = ({
  user,
  open,
  onOpenChange,
  onEdit,
}) => {
  if (!user) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy, HH:mm');
    } catch (error) {
      return dateString || '-';
    }
  };

  const getRoleBadge = (role: string | null) => {
    if (!role) return <span className="text-gray-500">-</span>;
    
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
          <DialogTitle>Detail User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="font-semibold">ID:</div>
            <div className="col-span-2 break-all">{user.id}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="font-semibold">Username:</div>
            <div className="col-span-2">{user.username || '-'}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="font-semibold">Email:</div>
            <div className="col-span-2">{user.email || '-'}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="font-semibold">Role:</div>
            <div className="col-span-2">{getRoleBadge(user.role)}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="font-semibold">Dibuat pada:</div>
            <div className="col-span-2">{formatDate(user.created_at)}</div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Tutup</Button>
          </DialogClose>
          <Button onClick={onEdit}>Edit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 