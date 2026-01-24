import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get token from query params
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(
        generateHtmlResponse('Error', 'Invalid verification link. Missing token.', false),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    // Find user with this token
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('user_email, verification_token_expires, email_verified')
      .eq('verification_token', token)
      .single();

    if (findError || !user) {
      return new Response(
        generateHtmlResponse('Error', 'Invalid or expired verification link.', false),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    // Check if already verified
    if (user.email_verified) {
      return new Response(
        generateHtmlResponse('Already Verified', 'Your email is already verified. You can log in to the app.', true),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    // Check if token is expired
    if (new Date(user.verification_token_expires) < new Date()) {
      return new Response(
        generateHtmlResponse('Expired', 'This verification link has expired. Please request a new one from the app.', false),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    // Update user as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        email_verified: true,
        verification_token: null,
        verification_token_expires: null,
      })
      .eq('verification_token', token);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        generateHtmlResponse('Error', 'Failed to verify email. Please try again.', false),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    return new Response(
      generateHtmlResponse('Success!', 'Your email has been verified. You can now log in to the Book Progress Tracker app.', true),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      generateHtmlResponse('Error', 'Something went wrong. Please try again.', false),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );
  }
});

function generateHtmlResponse(title: string, message: string, success: boolean): string {
  const color = success ? '#10b981' : '#ef4444';
  const icon = success ? '✓' : '✗';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Book Progress Tracker</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card {
          background: white;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 400px;
        }
        .icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: ${color};
          color: white;
          font-size: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        h1 {
          color: #1f2937;
          margin-bottom: 10px;
        }
        p {
          color: #6b7280;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">${icon}</div>
        <h1>${title}</h1>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `;
}
