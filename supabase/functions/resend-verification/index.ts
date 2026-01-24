import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a random verification token
const generateVerificationToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
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

    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find user
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('user_email, username, email_verified')
      .eq('user_email', email.toLowerCase())
      .single();

    if (findError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'No account found with this email' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already verified
    if (user.email_verified) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email is already verified' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Update user with new token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        verification_token: verificationToken,
        verification_token_expires: tokenExpires,
      })
      .eq('user_email', email.toLowerCase());

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to generate verification link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send verification email using Resend API
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const APP_URL = Deno.env.get('APP_URL') || 'https://pkcilxghwjxsqgfkpieh.supabase.co';
    
    if (RESEND_API_KEY) {
      const verificationLink = `${APP_URL}/functions/v1/verify-email?token=${verificationToken}`;
      
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'BookTracker <onboarding@resend.dev>',
            to: [email],
            subject: 'Verify your email - Book Progress Tracker',
            html: `
              <h2>Email Verification</h2>
              <p>Hi ${user.username},</p>
              <p>Please verify your email address by clicking the link below:</p>
              <p><a href="${verificationLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a></p>
              <p>Or copy this link: ${verificationLink}</p>
              <p>This link expires in 24 hours.</p>
            `,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification email sent! Please check your inbox.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Resend verification error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
