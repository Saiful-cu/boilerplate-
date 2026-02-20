/**
 * Validate required fields
 */
export const validateRequired = (fields: string[], data: Record<string, any>): { isValid: boolean; message?: string } => {
    const missing: string[] = [];
    for (const field of fields) {
        if (!data[field] || data[field] === '') {
            missing.push(field);
        }
    }
    if (missing.length > 0) {
        return { isValid: false, message: `Missing required fields: ${missing.join(', ')}` };
    }
    return { isValid: true };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string, minLength = 6): { isValid: boolean; message?: string } => {
    if (!password || password.length < minLength) {
        return { isValid: false, message: `Password must be at least ${minLength} characters` };
    }
    return { isValid: true };
};

/**
 * Validate MongoDB ObjectId
 */
export const validateObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validate number range
 */
export const validateNumberRange = (
    value: any,
    min: number,
    max: number,
    fieldName = 'Value'
): { isValid: boolean; message?: string } => {
    const num = Number(value);
    if (isNaN(num)) {
        return { isValid: false, message: `${fieldName} must be a number` };
    }
    if (num < min || num > max) {
        return { isValid: false, message: `${fieldName} must be between ${min} and ${max}` };
    }
    return { isValid: true };
};

/**
 * Sanitize string input
 */
export const sanitizeString = (str: any): string => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

/**
 * Validate array not empty
 */
export const validateArrayNotEmpty = (arr: any, fieldName = 'Array'): { isValid: boolean; message?: string } => {
    if (!Array.isArray(arr) || arr.length === 0) {
        return { isValid: false, message: `${fieldName} must not be empty` };
    }
    return { isValid: true };
};
