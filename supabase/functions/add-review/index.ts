import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userEmail, bookId, googleBooksId, rating, reviewText } = await req.json();

    if (!userEmail || (!bookId && !googleBooksId) || !rating) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields: userEmail, bookId/googleBooksId, rating' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ success: false, message: 'Rating must be between 1 and 5' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user ID from email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('user_email', userEmail.toLowerCase())
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get book ID (either directly or via google_books_id)
    let dbBookId = bookId;
    if (!dbBookId && googleBooksId) {
      const { data: book } = await supabase
        .from('books')
        .select('id')
        .eq('google_books_id', googleBooksId)
        .single();

      if (!book) {
        return new Response(
          JSON.stringify({ success: false, message: 'Book not found. Add the book to your reading list first.' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      dbBookId = book.id;
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('book_id', dbBookId)
      .single();

    if (existingReview) {
      // Update existing review
      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          rating,
          review_text: reviewText || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingReview.id);

      if (updateError) {
        console.error('Error updating review:', updateError);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to update review' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Review updated', reviewId: existingReview.id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Insert new review
      const { data: newReview, error: insertError } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          book_id: dbBookId,
          rating,
          review_text: reviewText || null,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error inserting review:', insertError);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to add review' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Review added', reviewId: newReview.id }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
