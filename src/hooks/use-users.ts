import { useState, useEffect, useCallback } from 'react';
import { UserService, User, UserFilter, UserRole } from '@/services/user-service';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<UserFilter>({});

  const fetchUsers = useCallback(async (filterParams: UserFilter = {}) => {
    try {
      setLoading(true);
      const data = await UserService.getUsers(filterParams);
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Terjadi kesalahan saat mengambil data user'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(filter);
  }, [filter, fetchUsers]);

  const searchUsers = useCallback((search: string) => {
    setFilter(prev => ({ ...prev, search }));
  }, []);

  const filterByRole = useCallback((role: UserRole | undefined) => {
    setFilter(prev => ({ ...prev, role }));
  }, []);

  return {
    users,
    loading,
    error,
    filter,
    searchUsers,
    filterByRole,
    refreshUsers: () => fetchUsers(filter)
  };
};

export const useUser = (userId: string | undefined) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const data = await UserService.getUserById(userId);
      setUser(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Terjadi kesalahan saat mengambil data user'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateUser = useCallback(async (updates: { username?: string, role?: UserRole }) => {
    if (!userId || !user) return null;
    
    try {
      setLoading(true);
      const updatedUser = await UserService.updateUser(userId, updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Terjadi kesalahan saat memperbarui user'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, user]);

  return {
    user,
    loading,
    error,
    updateUser,
    refreshUser: fetchUser
  };
}; 