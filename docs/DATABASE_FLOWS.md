# Database & API Flow Documentation

## Overview

This document describes the complete data flow between the React Native app, Supabase Edge Functions, and the database.

---

## Database Schema

```
┌──────────────┐
│    users     │
│──────────────│
│ id (UUID)    │◄─────────────────────────────────┐
│ user_email   │                                  │
│ username     │                                  │
│ password     │                                  │
│ created_at   │                                  │
└──────────────┘                                  │
                                                  │
┌──────────────┐      ┌───────────────┐      ┌────┴───────┐
│    books     │      │  book_authors │      │ user_books │
│──────────────│      │───────────────│      │────────────│
│ id (UUID)    │◄────►│ book_id       │      │ user_id    │
│ google_id    │      │ author_id     │      │ book_id    │
│ isbn         │      │ role          │      │ status     │
│ title        │      └───────┬───────┘      │ current_pg │
│ description  │              │              │ start_date │
│ thumbnail    │              ▼              │ finish_date│
│ page_count   │      ┌───────────────┐      └────────────┘
│ categories   │      │   authors     │
└──────┬───────┘      │───────────────│      ┌────────────┐
       │              │ id (UUID)     │      │  reviews   │
       │              │ name          │      │────────────│
       │              │ bio           │      │ user_id    │
       │              │ image_url     │      │ book_id    │
       └──────────────┴───────────────┘      │ rating     │
                                             │ review_text│
                                             └────────────┘
```

---

## API Endpoints

| Endpoint | Method | Purpose | Tables Affected |
|----------|--------|---------|-----------------|
| `add-user-book` | POST | Add book to reading list | books, authors, book_authors, user_books |
| `add-review` | POST | Add/update book review | reviews |
| `get-reviews` | GET | Get reviews for a book | reviews, users |

---

## Data Flow Diagrams

### 1. Add Book to Reading List

```
┌─────────────────┐
│ User taps       │
│ "Add to Reading"│
└────────┬────────┘
         ▼
┌─────────────────┐
│ saveUserBook()  │  ◄── src/storage/storage.ts
│ (Local Storage) │
└────────┬────────┘
         ▼
┌─────────────────┐
│syncBookToDatabase│  ◄── Async, non-blocking
└────────┬────────┘
         ▼
┌─────────────────┐
│ booksApi.       │  ◄── src/services/api.ts
│ addUserBook()   │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Edge Function   │  ◄── supabase/functions/add-user-book
│ add-user-book   │
└────────┬────────┘
         ▼
┌─────────────────────────────────────────────────┐
│                  DATABASE                        │
│  ┌─────────┐  ┌─────────┐  ┌──────────────┐     │
│  │ books   │  │ authors │  │ book_authors │     │
│  │ (cache) │  │ (new)   │  │ (link)       │     │
│  └────┬────┘  └────┬────┘  └──────────────┘     │
│       │            │                             │
│       ▼            ▼                             │
│  ┌────────────────────┐                          │
│  │    user_books      │  ◄── Links user to book │
│  │ (reading progress) │                          │
│  └────────────────────┘                          │
└─────────────────────────────────────────────────┘
```

### 2. Add Review Flow

```
┌─────────────────┐
│ User submits    │
│ rating/review   │
└────────┬────────┘
         ▼
┌─────────────────┐
│ booksApi.       │  ◄── src/services/api.ts
│ addReview()     │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Edge Function   │  ◄── supabase/functions/add-review
│ add-review      │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Check: User has │  ◄── REQUIRED: Book must be in user_books
│ book in list?   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   YES        NO
    │         │
    ▼         ▼
┌─────────┐  ┌─────────────┐
│ reviews │  │ Error 403   │
│ (insert │  │ "Add book   │
│ /update)│  │ first"      │
└─────────┘  └─────────────┘
```

### 3. Get Reviews Flow

```
┌─────────────────┐
│ User views      │
│ book details    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ booksApi.       │  ◄── src/services/api.ts
│ getReviews()    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Edge Function   │  ◄── supabase/functions/get-reviews
│ get-reviews     │
└────────┬────────┘
         ▼
┌─────────────────────────────────────┐
│ Response:                           │
│ {                                   │
│   reviews: [...],                   │
│   averageRating: 4.5,               │
│   totalReviews: 12                  │
│ }                                   │
└─────────────────────────────────────┘
```

### 4. Logout Flow

```
┌─────────────────┐
│ User taps       │
│ "Log Out"       │
└────────┬────────┘
         ▼
┌─────────────────┐
│ signOut()       │  ◄── src/services/authService.ts
│ (Clear session) │
└────────┬────────┘
         ▼
┌─────────────────┐
│ AsyncStorage.   │  ◄── Clears ALL local data
│ clear()         │
└────────┬────────┘
         ▼
┌─────────────────┐
│ navigation.     │  ◄── Prevents back navigation
│ reset('Login')  │
└─────────────────┘
```

---

## Frontend API Reference

### booksApi (src/services/api.ts)

```typescript
// Add book to user's reading list
booksApi.addUserBook(
  userEmail: string,
  book: Book,
  status: 'reading' | 'completed' | 'want-to-read',
  currentPage?: number,
  startDate?: string,
  finishDate?: string
): Promise<{ success: boolean, bookId?: string }>

// Add or update a review
booksApi.addReview(
  userEmail: string,
  googleBooksId: string,
  rating: number,        // 1-5
  reviewText?: string
): Promise<{ success: boolean, reviewId?: string }>

// Get reviews for a book
booksApi.getReviews(
  googleBooksId: string
): Promise<{
  success: boolean,
  reviews: Array<{
    id: string,
    rating: number,
    reviewText: string,
    username: string,
    createdAt: string
  }>,
  averageRating: number | null,
  totalReviews: number
}>
```

---

## Table Relationships

| Parent Table | Child Table | Relationship | On Delete |
|--------------|-------------|--------------|-----------|
| users | user_books | One-to-Many | CASCADE |
| users | reviews | One-to-Many | CASCADE |
| books | user_books | One-to-Many | CASCADE |
| books | reviews | One-to-Many | CASCADE |
| books | book_authors | One-to-Many | CASCADE |
| authors | book_authors | One-to-Many | CASCADE |

---

## Status Values

### user_books.status
| Value | Description |
|-------|-------------|
| `reading` | Currently reading |
| `completed` | Finished reading |
| `want-to-read` | On wishlist |

### reviews.rating
| Value | Description |
|-------|-------------|
| 1 | ⭐ |
| 2 | ⭐⭐ |
| 3 | ⭐⭐⭐ |
| 4 | ⭐⭐⭐⭐ |
| 5 | ⭐⭐⭐⭐⭐ |
