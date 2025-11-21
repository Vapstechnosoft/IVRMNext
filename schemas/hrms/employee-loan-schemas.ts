import { z } from 'zod';

/**
 * Employee Loan Schemas
 * Requirements:
 * - Employee – Mandatory
 * - Applied Date – Mandatory – Calendar
 * - Loan Type – Mandatory
 * - Mode Of Payment – Mandatory
 * - Reference No. – Not mandatory - Numeric – 20 characters
 * - Loan Amount – Mandatory – Decimal– (10,2)
 * - Loan Interest – Mandatory – Decimal – (5,2)
 * - Loan instalments (IN months) – Numeric – 4
 * - Loan EMI – Loan EMI – Decimal – (10,2)
 */

// Form schema matching the form interface
export const employeeLoanFormSchema = z.object({
    employeeId: z.number().min(1, 'Employee is required'),
    loanTypeId: z.number().min(1, 'Loan Type is required'),
    amount: z
        .number()
        .min(0.01, 'Loan Amount must be greater than 0')
        .refine((val) => {
            const str = val.toString();
            const parts = str.split('.');
            return parts[0].length <= 8 && (parts[1]?.length || 0) <= 2;
        }, 'Loan Amount must be in decimal format (10,2)'),
    installments: z
        .number()
        .int('Loan Installments must be a whole number')
        .min(1, 'Loan Installments must be at least 1')
        .max(9999, 'Loan Installments must not exceed 9999'),
    startDate: z.string().min(1, 'Applied Date is required'),
    modeOfPayment: z.string().min(1, 'Mode Of Payment is required'),
    referenceNo: z
        .string()
        .max(20, 'Reference No. must not exceed 20 characters')
        .regex(/^\d*$/, 'Reference No. must contain only numbers')
        .optional()
        .or(z.literal('')),
    loanInterest: z
        .number()
        .min(0, 'Loan Interest is required')
        .refine((val) => {
            const str = val.toString();
            const parts = str.split('.');
            return parts[0].length <= 3 && (parts[1]?.length || 0) <= 2;
        }, 'Loan Interest must be in decimal format (5,2)'),
    loanEMI: z
        .number()
        .min(0.01, 'Loan EMI is required')
        .refine((val) => {
            const str = val.toString();
            const parts = str.split('.');
            return parts[0].length <= 8 && (parts[1]?.length || 0) <= 2;
        }, 'Loan EMI must be in decimal format (10,2)')
});

export const employeeLoanSchema = {
    addOrUpdate: z.object({
        HREL_Id: z.number().optional(),
        MI_Id: z.number(),
        HRME_Id: z.number().min(1, 'Employee is required'),
        HRMLN_Id: z.number().min(1, 'Loan Type is required'),
        HREL_AppliedDate: z.string().min(1, 'Applied Date is required'),
        HREL_ModeOfPayment: z.string().min(1, 'Mode Of Payment is required'),
        HREL_ReferenceNo: z
            .string()
            .max(20, 'Reference No. must not exceed 20 characters')
            .regex(/^\d*$/, 'Reference No. must contain only numbers')
            .optional()
            .or(z.literal('')),
        HREL_LoanAmount: z
            .number()
            .min(0.01, 'Loan Amount must be greater than 0')
            .refine((val) => {
                const str = val.toString();
                const parts = str.split('.');
                return parts[0].length <= 8 && (parts[1]?.length || 0) <= 2;
            }, 'Loan Amount must be in decimal format (10,2)'),
        HREL_LoanInterest: z
            .number()
            .min(0, 'Loan Interest must be greater than or equal to 0')
            .refine((val) => {
                const str = val.toString();
                const parts = str.split('.');
                return parts[0].length <= 3 && (parts[1]?.length || 0) <= 2;
            }, 'Loan Interest must be in decimal format (5,2)'),
        HREL_LoanInsallments: z
            .number()
            .int('Loan Installments must be a whole number')
            .min(1, 'Loan Installments must be at least 1')
            .max(9999, 'Loan Installments must not exceed 9999'),
        HREL_LaonEMI: z
            .number()
            .min(0.01, 'Loan EMI must be greater than 0')
            .refine((val) => {
                const str = val.toString();
                const parts = str.split('.');
                return parts[0].length <= 8 && (parts[1]?.length || 0) <= 2;
            }, 'Loan EMI must be in decimal format (10,2)'),
        HREL_ActiveFlag: z.boolean().default(true),
        LogInUserId: z.number().optional()
    })
};
