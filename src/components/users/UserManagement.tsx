'use client';

import React, { useState } from 'react';
import { useUsers, useUser } from '@/hooks/use-users';
import { UsersTable } from '@/components/users/UsersTable';
import { UsersFilter } from '@/components/users/UsersFilter';
import { UserDetailDialog } from '@/components/users/UserDetailDialog';
import { UserEditDialog } from '@/components/users/UserEditDialog';
import { User, UserRole } from '@/services/user-service';
import { useToast } from '@/components/ui/use-toast';

export function UserManagement() {
  const { users, loading, error, searchUsers, filterByRole, refreshUsers } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const { user, updateUser } = useUser(selectedUserId);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { toast } = useToast();

  const handleViewDetails = (user: User) => {
    setSelectedUserId(user.id);
    setDetailOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUserId(user.id);
    setEditOpen(true);
  };

  const handleEditFromDetails = () => {
    setDetailOpen(false);
    setEditOpen(true);
  };

  const handleSaveUser = async (updates: { username?: string; role?: UserRole }) => {
    try {
      await updateUser(updates);
      refreshUsers();
      toast({
        title: 'User berhasil diperbarui',
        description: 'Perubahan telah disimpan',
      });
    } catch (error) {
      toast({
        title: 'Gagal memperbarui user',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen User</h1>
      </div>

      <div className="mb-6">
        <UsersFilter
          onSearchChange={searchUsers}
          onRoleChange={filterByRole}
        />
      </div>

      {error ? (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
          Error: {error.message}
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center my-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <UsersTable
          users={users}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
        />
      )}

      <UserDetailDialog
        user={user}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEditFromDetails}
      />

      <UserEditDialog
        user={user}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleSaveUser}
      />
    </div>
  );
} 