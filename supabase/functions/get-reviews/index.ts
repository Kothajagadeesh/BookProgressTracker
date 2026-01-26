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

    const url = new URL(req.url);
    const googleBooksId = url.searchParams.get('googleBooksId');
    const bookId = url.searchParams.get('bookId');

    if (!googleBooksId && !bookId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameter: googleBooksId or bookId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get book ID if using googleBooksId
    let dbBookId = bookId;
    if (!dbBookId && googleBooksId) {
      const { data: book } = await supabase
        .from('books')
        .select('id')
        .eq('google_books_id', googleBooksId)
        .single();

      if (!book) {
        return new Response(
          JSON.stringify({ success: true, reviews: [], averageRating: null, totalReviews: 0 }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      dbBookId = book.id;
    }

    // Get reviews with user info
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        review_text,
        created_at,
        updated_at,
        users (
          username
        )
      `)
      .eq('book_id', dbBookId)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to fetch reviews' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate average rating
    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : null;

    // Format reviews
    const formattedReviews = reviews?.map(r => ({
      id: r.id,
      rating: r.rating,
      reviewText: r.review_text,
      username: r.users?.username || 'Anonymous',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })) || [];

    return new Response(
      JSON.stringify({
        success: true,
        reviews: formattedReviews,
        averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null,
        totalReviews,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
