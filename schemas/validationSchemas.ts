import { z } from 'zod';

/**
 * Creates a schema with min and max length validations.
 *
 * @param {string} field - The name of the field (for error messages).
 * @param {number} min - The minimum allowed length (inclusive).
 * @param {number} max - The maximum allowed length (inclusive).
 * @returns {z.ZodString} The string schema.
 */

export function createStringSchema(field: string, min: number, max: number) {
    return z
        .string({ message: `${field} is required` })
        .min(min, { message: `Minimum ${min} characters required for ${field}` })
        .max(max, { message: `Maximum ${max} characters allowed for ${field}` })
        .refine((value) => value.trim() === value, {
            message: `${field} cannot have leading or trailing spaces`
        });
}

export function createOptionalStringSchema(field: string, min: number, max: number) {
    return z
        .string()
        .max(max, { message: `Maximum ${max} characters allowed for ${field}` })
        .refine((value) => value.length === 0 || value.trim() === value, {
            message: `${field} cannot have leading or trailing spaces`
        })
        .refine((value) => value.length === 0 || value.length >= min, {
            message: `${field} must have at least ${min} characters or be empty.`,
            path: [field]
        })
        .optional()
        .or(z.literal('')); // Allow empty string explicitly
}

export function createAlphanumericSchema(field: string, min: number, max: number, optional = false) {
    const baseSchema = z
        .string({ message: `${field} is required` })
        .min(min, { message: `Minimum ${min} characters required for ${field}` })
        .max(max, { message: `Maximum ${max} characters allowed for ${field}` })
        .regex(/^[a-zA-Z0-9]*$/, {
            message: `${field} must contain only alphanumeric characters`
        })
        .refine((value) => value.trim() === value, {
            message: `${field} cannot have leading or trailing spaces`
        });

    if (optional) {
        return baseSchema
            .optional()
            .or(z.literal(''))
            .transform((v) => (v === '' ? undefined : v));
    }

    return baseSchema;
}

// Create email validation schema with optional field
export function createEmailSchema(field: string, min: number, max: number, optional = false) {
    const baseSchema = z
        .string({ message: `${field} is required` })
        .min(min, { message: `Minimum ${min} characters required for ${field}` })
        .max(max, { message: `Maximum ${max} characters allowed for ${field}` })
        .email({ message: `${field} must be a valid email address` })
        .refine((value) => value.trim() === value, {
            message: `${field} cannot have leading or trailing spaces`
        });

    if (optional) {
        return baseSchema
            .optional()
            .or(z.literal(''))
            .transform((v) => (v === '' ? undefined : v));
    }

    return baseSchema;
}

export function deleteIdSchema(field: string) {
    return z.string({ message: `${field} is required` }).refine((value) => value.length > 0, {
        message: `${field} is required`,
        path: [field]
    });
}
