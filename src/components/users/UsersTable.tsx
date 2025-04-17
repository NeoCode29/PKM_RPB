import React from 'react';
import { User } from '@/services/user-service';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { EyeIcon, PencilIcon } from 'lucide-react';

interface UsersTableProps {
  users: User[];
  onViewDetails: (user: User) => void;
  onEdit: (user: User) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onViewDetails,
  onEdit,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Email</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Dibuat Pada</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">
                Tidak ada data user
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email || '-'}</TableCell>
                <TableCell>{user.username || '-'}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onViewDetails(user)}
                      title="Lihat Detail"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(user)}
                      title="Edit User"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}; 