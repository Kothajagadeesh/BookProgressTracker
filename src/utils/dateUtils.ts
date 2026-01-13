/**
 * Format date to readable string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Get relative time string (e.g., "2 days ago")
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
};

/**
 * Calculate days since start date
 */
export const daysSinceStart = (startDate: string): number => {
  const start = new Date(startDate);
  const now = new Date();
  const diffInMs = now.getTime() - start.getTime();
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
};

/**
 * Calculate reading progress percentage
 */
export const calculateProgress = (currentPage: number, totalPages: number): number => {
  if (!totalPages || totalPages === 0) return 0;
  return Math.min(100, Math.round((currentPage / totalPages) * 100));
};

/**
 * Calculate expected pages based on goal
 */
export const calculateExpectedPages = (
  startDate: string,
  goalType: 'duration' | 'pages' | undefined,
  goalValue: number | undefined,
  totalPages: number | undefined,
): number => {
  if (!goalType || !goalValue || !totalPages) return 0;

  const daysPassed = daysSinceStart(startDate);

  if (goalType === 'pages') {
    // Pages per day goal
    return Math.min(daysPassed * goalValue, totalPages);
  } else {
    // Duration goal (months)
    const totalDays = goalValue * 30;
    const expectedProgress = (daysPassed / totalDays) * totalPages;
    return Math.min(Math.round(expectedProgress), totalPages);
  }
};

/**
 * Check if user is on track with their goal
 */
export const isOnTrack = (
  currentPage: number,
  startDate: string,
  goalType: 'duration' | 'pages' | undefined,
  goalValue: number | undefined,
  totalPages: number | undefined,
): boolean => {
  const expectedPages = calculateExpectedPages(startDate, goalType, goalValue, totalPages);
  return currentPage >= expectedPages;
};

/**
 * Get goal description text
 */
export const getGoalDescription = (
  goalType: 'duration' | 'pages' | undefined,
  goalValue: number | undefined,
): string => {
  if (!goalType || !goalValue) return 'No goal set';
  
  if (goalType === 'pages') {
    return `${goalValue} pages per day`;
  } else {
    return `Complete in ${goalValue} ${goalValue === 1 ? 'month' : 'months'}`;
  }
};
