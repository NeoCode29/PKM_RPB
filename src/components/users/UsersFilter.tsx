import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { UserRole } from '@/services/user-service';

interface UsersFilterProps {
  onSearchChange: (search: string) => void;
  onRoleChange: (role: UserRole | undefined) => void;
  initialSearch?: string;
  initialRole?: UserRole;
}

export const UsersFilter: React.FC<UsersFilterProps> = ({
  onSearchChange,
  onRoleChange,
  initialSearch = '',
  initialRole,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [role, setRole] = useState<string | null | undefined>(initialRole === null ? '' : initialRole);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setRole(initialRole === null ? '' : initialRole);
  }, [initialRole]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(search);
  };

  const handleRoleChange = (value: string) => {
    const newRole = value === 'all' ? undefined : (value as UserRole);
    setRole(value);
    onRoleChange(newRole);
  };

  const handleClearSearch = () => {
    setSearch('');
    onSearchChange('');
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <form onSubmit={handleSearchSubmit} className="flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search email atau username..."
            value={search}
            onChange={handleSearchChange}
            className="pl-8 pr-10"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </div>
      </form>

      <div className="w-full md:w-48">
        <Select 
          value={role || 'all'} 
          onValueChange={handleRoleChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="reviewer">Reviewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" onClick={handleSearchSubmit}>
        Cari
      </Button>
    </div>
  );
}; 