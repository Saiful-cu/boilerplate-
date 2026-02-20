import { SortOrder } from 'mongoose';

export interface PaginationOptions {
    page: number;
    limit: number;
    skip: number;
}

export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

/**
 * Build filter object from query parameters
 */
export const buildFilter = (query: Record<string, any>, allowedFields: string[]): Record<string, any> => {
    const filter: Record<string, any> = {};
    allowedFields.forEach((field) => {
        if (query[field]) {
            filter[field] = query[field];
        }
    });
    return filter;
};

/**
 * Build pagination options
 */
export const buildPagination = (query: Record<string, any>): PaginationOptions => {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

/**
 * Build sort object from query parameter
 */
export const buildSort = (sortQuery: string | undefined): Record<string, SortOrder> => {
    if (!sortQuery) return { createdAt: -1 };

    const sortMap: Record<string, Record<string, SortOrder>> = {
        'price-asc': { price: 1 },
        'price-desc': { price: -1 },
        'name-asc': { name: 1 },
        'name-desc': { name: -1 },
        'date-asc': { createdAt: 1 },
        'date-desc': { createdAt: -1 },
        'rating-desc': { rating: -1 },
    };

    return sortMap[sortQuery] || { createdAt: -1 };
};

/**
 * Build search filter for text fields
 */
export const buildSearchFilter = (searchQuery: string | undefined, fields: string[]): Record<string, any> => {
    if (!searchQuery || fields.length === 0) return {};

    const searchRegex = new RegExp(searchQuery, 'i');
    return {
        $or: fields.map((field) => ({ [field]: searchRegex })),
    };
};

/**
 * Build pagination metadata
 */
export const buildPaginationMeta = (total: number, page: number, limit: number): PaginationMeta => {
    const totalPages = Math.ceil(total / limit);
    return {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};

/**
 * Get paginated response with metadata
 */
export const getPaginatedResponse = <T>(data: T[], total: number, page: number, limit: number) => {
    return {
        data,
        pagination: buildPaginationMeta(total, page, limit),
    };
};
