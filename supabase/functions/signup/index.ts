import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignupRequest {
  email: string;
  password: string;
  username: string;
}

interface ValidationError {
  field: string;
  message: string;
}

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

const validateUsername = (username: string): boolean => {
  return username.length >= 2 && username.length <= 30;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, password, username }: SignupRequest = await req.json();

    // Validation
    const errors: ValidationError[] = [];

    if (!email || !validateEmail(email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }

    if (!password || !validatePassword(password)) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }

    if (!username || !validateUsername(username)) {
      errors.push({ field: 'username', message: 'Username must be 2-30 characters' });
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ success: false, errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('user_email')
      .eq('user_email', email.toLowerCase())
      .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          errors: [{ field: 'email', message: 'Email already registered' }] 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('users')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();

    if (existingUsername) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          errors: [{ field: 'username', message: 'Username already taken' }] 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert user into database
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        user_email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: password, // Note: In production, hash this password
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          email: newUser.user_email,
          username: newUser.username,
          created_at: newUser.created_at,
        }
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
