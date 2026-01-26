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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userEmail, book, status, currentPage, startDate, finishDate } = await req.json();

    if (!userEmail || !book || !status) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields: userEmail, book, status' }),
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

    // Check if book already exists in books table
    let bookId: string;
    const { data: existingBook } = await supabase
      .from('books')
      .select('id')
      .eq('google_books_id', book.id)
      .single();

    if (existingBook) {
      bookId = existingBook.id;
    } else {
      // Insert new book
      const { data: newBook, error: bookError } = await supabase
        .from('books')
        .insert({
          google_books_id: book.id,
          title: book.title,
          isbn: book.isbn || null,
          description: book.description || null,
          thumbnail: book.thumbnail || null,
          page_count: book.pageCount || null,
          published_date: book.publishedDate || null,
          categories: book.categories || null,
        })
        .select('id')
        .single();

      if (bookError) {
        console.error('Error inserting book:', bookError);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to save book' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      bookId = newBook.id;

      // Insert authors if provided
      if (book.authors && book.authors.length > 0) {
        for (const authorName of book.authors) {
          // Check if author exists
          let authorId: string;
          const { data: existingAuthor } = await supabase
            .from('authors')
            .select('id')
            .eq('name', authorName)
            .single();

          if (existingAuthor) {
            authorId = existingAuthor.id;
          } else {
            // Insert new author
            const { data: newAuthor, error: authorError } = await supabase
              .from('authors')
              .insert({ name: authorName })
              .select('id')
              .single();

            if (authorError) {
              console.error('Error inserting author:', authorError);
              continue;
            }
            authorId = newAuthor.id;
          }

          // Link book to author
          await supabase
            .from('book_authors')
            .insert({ book_id: bookId, author_id: authorId })
            .select();
        }
      }
    }

    // Check if user already has this book
    const { data: existingUserBook } = await supabase
      .from('user_books')
      .select('id')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .single();

    if (existingUserBook) {
      // Update existing user_book entry
      const { error: updateError } = await supabase
        .from('user_books')
        .update({
          status,
          current_page: currentPage || 0,
          start_date: startDate || null,
          finish_date: finishDate || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUserBook.id);

      if (updateError) {
        console.error('Error updating user_book:', updateError);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to update reading status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Insert new user_book entry
      const { error: insertError } = await supabase
        .from('user_books')
        .insert({
          user_id: user.id,
          book_id: bookId,
          status,
          current_page: currentPage || 0,
          start_date: startDate || null,
          finish_date: finishDate || null,
        });

      if (insertError) {
        console.error('Error inserting user_book:', insertError);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to add book to reading list' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Book added to reading list',
        bookId 
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
