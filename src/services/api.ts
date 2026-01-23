// API service for calling Supabase Edge Functions
// This provides a backend layer between the app and the database

const SUPABASE_URL = 'https://pkcilxghwjxsqgfkpieh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrY2lseGdod2p4c3FnZmtwaWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMzI0NzgsImV4cCI6MjA4NDcwODQ3OH0.Wx-vkdAuCip-0UkJitVyndMM7DRhvWCb2TjB2f-LeDk';

const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
  message?: string;
}

interface UserData {
  email: string;
  username: string;
  created_at?: string;
}

// Generic API call function
const apiCall = async <T>(
  endpoint: string,
  method: string = 'POST',
  body?: object
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        errors: data.errors,
        message: data.message || 'Request failed',
      };
    }

    return {
      success: true,
      data: data.user || data,
    };
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
};

// Auth API endpoints
export const authApi = {
  // Sign up a new user
  signup: async (email: string, password: string, username: string): Promise<ApiResponse<UserData>> => {
    return apiCall<UserData>('signup', 'POST', { email, password, username });
  },

  // Sign in existing user
  signin: async (email: string, password: string): Promise<ApiResponse<UserData>> => {
    return apiCall<UserData>('signin', 'POST', { email, password });
  },
};

export default authApi;
