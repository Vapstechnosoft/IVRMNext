import { z } from 'zod';

/**
 * Employee Loan Schemas
 */
export const employeeLoanSchema = {
    addOrUpdate: z
        .object({
            HREL_Id: z.number().optional(),
            MI_Id: z.number(),
            HRME_Id: z.number().min(1, 'Please select an employee'),
            HRMLN_Id: z.number().min(1, 'Please select loan type'),
            HREL_LoanAmount: z.number().min(1, 'Loan amount must be greater than 0'),
            HREL_LoanInstallement: z.number().min(1, 'Number of installments must be at least 1'),
            HREL_TotalLoanAmount: z.number().min(1, 'Total loan amount must be greater than 0'),
            HREL_LoanDate: z.date({
                required_error: 'Loan date is required'
            }),
            HREL_Remarks: z.string().optional(),
            HREL_ActiveFlag: z.boolean().default(true),
            LogInUserId: z.number().optional()
        })
        .refine((data) => data.HREL_TotalLoanAmount >= data.HREL_LoanAmount, {
            message: 'Total loan amount must be greater than or equal to loan amount',
            path: ['HREL_TotalLoanAmount']
        })
};
