import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
// Get these from your Supabase project: Settings > API
const SUPABASE_URL = 'https://pkcilxghwjxsqgfkpieh.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // TODO: Replace with your anon key from Supabase Dashboard > Settings > API

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types for the users table
export interface SupabaseUser {
  user_email: string;
  created_at?: string;
  username: string | null;
  password?: string; // Note: In production, passwords should be hashed
}

// Database operations for users table
export const supabaseDb = {
  // Insert a new user into the users table
  async createUser(userData: Omit<SupabaseUser, 'created_at'>): Promise<SupabaseUser | null> {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          user_email: userData.user_email,
          username: userData.username,
          password: userData.password,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return data;
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<SupabaseUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Supabase select error:', error);
      throw error;
    }

    return data;
  },

  // Check if email exists
  async checkEmailExists(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('user_email')
      .eq('user_email', email)
      .single();

    if (error && error.code === 'PGRST116') {
      return false; // No user found
    }

    return !!data;
  },

  // Update user
  async updateUser(email: string, updates: Partial<SupabaseUser>): Promise<SupabaseUser | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_email', email)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    return data;
  },

  // Delete user
  async deleteUser(email: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('user_email', email);

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }
  },
};
