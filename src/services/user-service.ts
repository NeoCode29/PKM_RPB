import { supabaseClient } from '@/lib/supabase/client';

export type UserRole = 'admin' | 'reviewer' | null;

export interface User {
  id: string;
  created_at: string;
  role: UserRole;
  username: string | null;
  email: string | null;
}

export interface UserFilter {
  search?: string;
  role?: UserRole;
}

export const UserService = {
  async getUsers(filter: UserFilter = {}): Promise<User[]> {
    const supabase = supabaseClient();
    
    let query = supabase.from('users').select('*');
    
    if (filter.role) {
      query = query.eq('role', filter.role);
    }
    
    if (filter.search) {
      const searchTerm = `%${filter.search}%`;
      query = query.or(`email.ilike.${searchTerm},username.ilike.${searchTerm}`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    return data as User[];
  },
  
  async getUserById(id: string): Promise<User | null> {
    const supabase = supabaseClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
    
    return data as User;
  },
  
  async updateUser(id: string, updates: { username?: string, role?: UserRole }): Promise<User> {
    const supabase = supabaseClient();
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
    
    return data as User;
  }
}; 