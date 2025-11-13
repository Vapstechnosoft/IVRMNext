import { z } from 'zod';

/**
 * Salary Advance Schemas
 * Requirements:
 * - Employee – Mandatory
 * - Entry Date – Mandatory – Calendar
 * - Advanced Year – Mandatory
 * - Advanced Month – Mandatory
 * - Advanced Amount (Field name displayed in wrong it should be "Advanced Amount")– Mandatory – Decimal – (10,2)
 * - Mode of Payment – Mandatory
 * - Reference No – Numeric – AlphaNumeric - 255 characters
 * - Remarks – Text box – 255 characters
 */

// Form schema matching the form interface
export const salaryAdvanceFormSchema = z.object({
    employeeId: z.string().min(1, 'Employee is required'),
    entryDate: z.string().min(1, 'Entry Date is required'),
    advanceYear: z.string().min(1, 'Advanced Year is required'),
    advanceMonth: z.string().min(1, 'Advanced Month is required'),
    appliedAmount: z
        .number()
        .min(0.01, 'Advanced Amount must be greater than 0')
        .refine((val) => {
            const str = val.toString();
            const parts = str.split('.');
            return parts[0].length <= 8 && (parts[1]?.length || 0) <= 2;
        }, 'Advanced Amount must be in decimal format (10,2)'),
    modeOfPayment: z.string().min(1, 'Mode of Payment is required'),
    referenceNo: z
        .string()
        .max(255, 'Reference No must not exceed 255 characters')
        .regex(/^[A-Za-z0-9]*$/, 'Reference No must be alphanumeric')
        .optional()
        .or(z.literal('')),
    remarks: z.string().max(255, 'Remarks must not exceed 255 characters').optional().or(z.literal(''))
});

export const salaryAdvanceSchema = {
    addOrUpdate: z.object({
        HRESA_Id: z.number().optional(),
        MI_Id: z.number(),
        HRME_Id: z.number().min(1, 'Employee is required'),
        HRESA_EntryDate: z.string().min(1, 'Entry Date is required'),
        HRESA_AdvYear: z.number().min(1, 'Advanced Year is required'),
        HRESA_AdvMonth: z.string().min(1, 'Advanced Month is required'),
        HRESA_AppliedAmount: z
            .number()
            .min(0.01, 'Advanced Amount must be greater than 0')
            .refine((val) => {
                const str = val.toString();
                const parts = str.split('.');
                return parts[0].length <= 8 && (parts[1]?.length || 0) <= 2;
            }, 'Advanced Amount must be in decimal format (10,2)'),
        HRESA_ModeOfPayment: z.string().min(1, 'Mode of Payment is required'),
        HRESA_ReferenceNo: z
            .string()
            .max(255, 'Reference No must not exceed 255 characters')
            .regex(/^[A-Za-z0-9]*$/, 'Reference No must be alphanumeric')
            .optional()
            .or(z.literal('')),
        HRESA_Remarks: z.string().max(255, 'Remarks must not exceed 255 characters').optional().or(z.literal('')),
        HRESA_ActiveFlag: z.boolean().default(true),
        LogInUserId: z.number().optional()
    })
};
