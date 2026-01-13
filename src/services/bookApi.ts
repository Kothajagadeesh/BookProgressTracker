import axios from 'axios';
import {Book} from '../types';

const OPEN_LIBRARY_API = 'https://openlibrary.org';
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Search books from Open Library API
 */
export const searchBooksOpenLibrary = async (query: string): Promise<Book[]> => {
  try {
    const response = await axios.get(`${OPEN_LIBRARY_API}/search.json`, {
      params: {
        q: query,
        limit: 20,
      },
    });

    const books: Book[] = response.data.docs.map((doc: any) => ({
      id: doc.key || doc.cover_edition_key || `ol-${Date.now()}-${Math.random()}`,
      title: doc.title || 'Unknown Title',
      author: doc.author_name ? doc.author_name.join(', ') : 'Unknown Author',
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : undefined,
      isbn: doc.isbn ? doc.isbn[0] : undefined,
      pages: typeof doc.number_of_pages_median === 'number' ? doc.number_of_pages_median : undefined,
      publishedDate: doc.first_publish_year?.toString(),
      description: doc.first_sentence ? doc.first_sentence.join(' ') : undefined,
    }));

    return books;
  } catch (error) {
    console.error('Error searching Open Library:', error);
    return [];
  }
};

/**
 * Search books from Google Books API
 */
export const searchBooksGoogle = async (query: string): Promise<Book[]> => {
  try {
    const response = await axios.get(GOOGLE_BOOKS_API, {
      params: {
        q: query,
        maxResults: 20,
      },
    });

    const books: Book[] = (response.data.items || []).map((item: any) => ({
      id: item.id,
      title: item.volumeInfo?.title || 'Unknown Title',
      author: item.volumeInfo?.authors
        ? item.volumeInfo.authors.join(', ')
        : 'Unknown Author',
      coverUrl: item.volumeInfo?.imageLinks?.thumbnail?.replace('http://', 'https://'),
      isbn: item.volumeInfo?.industryIdentifiers?.[0]?.identifier,
      pages: typeof item.volumeInfo?.pageCount === 'number' ? item.volumeInfo.pageCount : undefined,
      publishedDate: item.volumeInfo?.publishedDate,
      description: item.volumeInfo?.description,
    }));

    return books;
  } catch (error) {
    console.error('Error searching Google Books:', error);
    return [];
  }
};

/**
 * Combined search that merges results from both APIs
 */
export const searchBooks = async (query: string): Promise<Book[]> => {
  try {
    const [openLibraryBooks, googleBooks] = await Promise.all([
      searchBooksOpenLibrary(query),
      searchBooksGoogle(query),
    ]);

    // Merge results, prioritizing Google Books for better metadata
    const combinedBooks = [...googleBooks];
    
    // Add Open Library books that aren't duplicates
    openLibraryBooks.forEach(olBook => {
      const isDuplicate = combinedBooks.some(
        gBook => {
          const gTitle = gBook.title?.toLowerCase() || '';
          const olTitle = olBook.title?.toLowerCase() || '';
          const gAuthor = gBook.author?.toLowerCase() || '';
          const olAuthor = olBook.author?.toLowerCase() || '';
          const olAuthorFirst = olAuthor.split(',')[0] || '';
          
          return gTitle === olTitle && gAuthor.includes(olAuthorFirst);
        },
      );
      
      if (!isDuplicate) {
        combinedBooks.push(olBook);
      }
    });

    return combinedBooks;
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
};

/**
 * Get book details by ID from Google Books
 */
export const getBookDetails = async (bookId: string): Promise<Book | null> => {
  try {
    const response = await axios.get(`${GOOGLE_BOOKS_API}/${bookId}`);
    const item = response.data;

    return {
      id: item.id,
      title: item.volumeInfo?.title || 'Unknown Title',
      author: item.volumeInfo?.authors
        ? item.volumeInfo.authors.join(', ')
        : 'Unknown Author',
      coverUrl: item.volumeInfo?.imageLinks?.thumbnail?.replace('http://', 'https://'),
      isbn: item.volumeInfo?.industryIdentifiers?.[0]?.identifier,
      pages: typeof item.volumeInfo?.pageCount === 'number' ? item.volumeInfo.pageCount : undefined,
      publishedDate: item.volumeInfo?.publishedDate,
      description: item.volumeInfo?.description,
    };
  } catch (error) {
    console.error('Error getting book details:', error);
    return null;
  }
};
