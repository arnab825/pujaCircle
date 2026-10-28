// Pagination parameters and calculations
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

// Paginated response wrapper for list queries
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Extracts and validates safe pagination parameters from request query
export function getPagination(query: any, defaultLimit = 20, maxLimit = 100): PaginationParams {
  const parsedPage = parseInt(query?.page as string, 10);
  const parsedLimit = parseInt(query?.limit as string, 10);

  const page = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  let limit = !isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

// Wraps dataset with standardized pagination metadata
export function buildPaginatedResult<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
