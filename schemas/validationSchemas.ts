import { z } from 'zod';

/**
 * Creates an schema with min and max length validations.
 *
 * @param {string} field - The name of the field (for error messages).
 * @param {number} min - The minimum allowed length (inclusive).
 * @param {number} max - The maximum allowed length (inclusive).
 * @returns {z.ZodOptional<z.ZodString>} The string schema.
 */
export function createStringSchema(field: string, min: number, max: number) {
    return z
        .string({ message: `${field} is required` })
        .min(min, { message: `Minimum ${min} characters required for ${field}` })
        .max(max, { message: `Maximum ${max} characters allowed for ${field}` })
        .refine((value) => value.length >= min || value.length === 0, {
            message: `${field} must have at least ${min} characters or be empty.`,
            path: [field]
        })
        .refine((value) => value.length <= max || value.length === 0, {
            message: `${field} can have a maximum of ${max} characters or be empty.`,
            path: [field]
        });
}

export function deleteIdSchema(field: string) {
    return z.string({ message: `${field} is required` }).refine((value) => value.length > 0, {
        message: `${field} is required`,
        path: [field]
    });
}
