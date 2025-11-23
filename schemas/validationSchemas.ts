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

export function createOptionalNumberOnlyStringSchema(field: string, min: number, max: number) {
    return z
        .string()
        .regex(/^\d*$/, { message: `${field} must contain only numbers` }) // allows only digits
        .max(max, { message: `Maximum ${max} characters allowed for ${field}` })
        .refine((value) => value.length === 0 || value.length >= min, {
            message: `${field} must have at least ${min} digits or be empty.`
        })
        .refine((value) => value.length === 0 || value.trim() === value, {
            message: `${field} cannot have leading or trailing spaces`
        })
        .optional()
        .or(z.literal('')); // empty allowed
}

export function createOptionalStringSchemaNotAllowNumbersOnly(field: string, min: number, max: number) {
    return (
        z
            .string()
            .max(max, { message: `Maximum ${max} characters allowed for ${field}` })

            // ❗ Prevent leading/trailing spaces
            .refine((value) => value.length === 0 || value.trim() === value, {
                message: `${field} cannot have leading or trailing spaces`
            })

            // ❗   numbers-only input
            .refine((value) => value.length === 0 || !/^\d+$/.test(value), {
                message: `${field} cannot contain only numbers`
            })

            // ❗ Must meet minimum length if not empty
            .refine((value) => value.length === 0 || value.length >= min, {
                message: `${field} must have at least ${min} characters or be empty.`
            })

            .optional()
            .or(z.literal(''))
    ); // Allow empty string explicitly
}

export function createStringSchemaNotAllowNumbersOnly(field: string, min: number, max: number) {
    return (
        z
            .string({ message: `${field} is required` })

            // 👉 Apply min & max early (before refine), so no TS error
            .min(min, { message: `${field} must have at least ${min} characters` })
            .max(max, { message: `Maximum ${max} characters allowed for ${field}` })

            // ❗ No special characters allowed — only letters, numbers, spaces
            .regex(/^[A-Za-z0-9\s]+$/, {
                message: `${field} cannot contain special characters`
            })

            // ❗ Prevent leading/trailing spaces
            .refine((value) => value.trim() === value, {
                message: `${field} cannot have leading or trailing spaces`
            })

            // ❗ Prevent only-numbers
            .refine((value) => !/^\d+$/.test(value), {
                message: `${field} cannot contain only numbers`
            })
    );
}

export function createStringOnlySchema(field: string, min: number, max: number) {
    return z
        .string({ message: `${field} is required` })
        .min(min, { message: `Minimum ${min} characters required for ${field}` })
        .max(max, { message: `Maximum ${max} characters allowed for ${field}` })
        .regex(/^[A-Za-z\s]+$/, { message: `${field} must contain only letters` })
        .refine((value) => value.trim() === value, {
            message: `${field} cannot have leading or trailing spaces`
        });
}

export function createStringOnlyOptionalSchema(field: string, min: number, max: number) {
    return z
        .string()
        .trim()
        .regex(/^[A-Za-z\s]+$/, { message: `${field} must contain only letters` })
        .min(min, { message: `Minimum ${min} characters required for ${field}` })
        .max(max, { message: `Maximum ${max} characters allowed for ${field}` })
        .optional()
        .or(z.literal(''));
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
        .min(min, { message: `${field} is required` })
        .max(max, { message: `Maximum ${max} characters allowed for ${field}` })
        .email({ message: `${field} must be a valid email address` })
        .refine((value) => value.trim() === value, {
            message: `${field} cannot have leading or trailing spaces`
        })
        // ❗ Must contain at least one letter before @
        .refine((value) => /[A-Za-z]/.test(value.split('@')[0]), {
            message: `${field} must contain at least one letter before '@'`
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

export function createCustomStringSchema(field: string, min: number, max: number) {
    return z
        .string({ message: `${field} is required` })
        .min(min, { message: `Minimum ${min} characters required for ${field}` })
        .max(max, { message: `Maximum ${max} characters allowed for ${field}` })
        .refine((val) => /[A-Za-z0-9]/.test(val), { message: 'Grade Name cannot contain only special characters' })
        .refine((value) => value.trim() === value, {
            message: `${field} cannot have leading or trailing spaces`
        })
        .refine((val) => /^[A-Za-z0-9][A-Za-z0-9\s!@#$%^&*(),.?":{}|<>-]*$/.test(val), {
            message: 'Grade Name should not start with a special character'
        })
        .refine((val) => !/^[0-9]+$/.test(val), { message: 'Grade Name cannot be only numbers' });
}

export function createOptionalAlphaNumericSchema(field: string, min: number, max: number) {
    return (
        z
            .string()
            .max(max, { message: `Maximum ${max} characters allowed for ${field}` })

            // ❗ No leading or trailing spaces
            .refine((value) => value.length === 0 || value.trim() === value, {
                message: `${field} cannot have leading or trailing spaces`
            })

            // ❗ Cannot start with a special character
            .refine((value) => value.length === 0 || /^[A-Za-z0-9]/.test(value), {
                message: `${field} cannot start with a special character`
            })

            // ❗ Must contain at least one alphabet if not empty
            .refine((value) => value.length === 0 || /[A-Za-z]/.test(value), { message: `${field} must contain at least one letter` })

            // ❗ Minimum length when not empty
            .refine((value) => value.length === 0 || value.length >= min, {
                message: `${field} must have at least ${min} characters or be empty.`
            })

            .optional()
            .or(z.literal(''))
    );
}

//pancard schema

export function createAlphanumericSchemaPanCard(field: string, optional = false) {
    const baseSchema = z
        .string()
        .length(10, { message: `${field} must be exactly 10 characters` })
        .refine((value) => /^[A-Za-z0-9]+$/.test(value), {
            message: `${field} must contain only alphanumeric characters`
        })
        .refine((value) => /[A-Za-z]/.test(value), {
            message: `${field} must contain at least one letter`
        })
        .refine((value) => /\d/.test(value), {
            message: `${field} must contain at least one number`
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

//with  not have number and special character

export function createOptionalStringWithLettersSchema(field: string, min: number, max: number) {
    return (
        z
            .string()
            .max(max, { message: `Maximum ${max} characters allowed for ${field}` })

            // No leading/trailing spaces
            .refine((value) => value.length === 0 || value.trim() === value, {
                message: `${field} cannot have leading or trailing spaces`
            })

            // Must contain at least ONE letter (to avoid only numbers / only special chars)
            .refine((value) => value.length === 0 || /[A-Za-z]/.test(value), {
                message: `${field} must contain at least one letter`
            })

            // Min length (if not empty)
            .refine((value) => value.length === 0 || value.length >= min, {
                message: `${field} must have at least ${min} characters or be empty.`
            })

            .optional()
            .or(z.literal(''))
    ); // empty allowed
}

//with number letter not optional
export function createOptionalAlphaNumericSchemaNotOptional(field: string, min: number, max: number) {
    return (
        z
            .string()
            .min(min, { message: `${field} must have at least ${min} characters` })
            .max(max, { message: `Maximum ${max} characters allowed for ${field}` })

            // Only letters and numbers allowed
            .regex(/^[A-Za-z0-9]+$/, {
                message: `${field} can contain only letters and numbers`
            })

            // No leading or trailing spaces
            .refine((value) => value.trim() === value, {
                message: `${field} cannot have leading or trailing spaces`
            })

            // Must contain at least one alphabet
            .refine((value) => /[A-Za-z]/.test(value), {
                message: `${field} must contain at least one letter`
            })

            // Optional (undefined allowed, but empty string not allowed)
            .optional()
    );
}

export function isAlphabetsOnly(text: string): boolean {
    return /^[a-zA-Z\s]*$/.test(text);
}
