import { z } from 'zod';

/**
 * Salary Increment Schemas
 */
export const salaryIncrementSchema = {
    addOrUpdate: z.object({
        HRESI_Id: z.number().optional(),
        MI_Id: z.number(),
        HRME_Id: z.number().min(1, 'Please select an employee'),
        HRESI_IncrementAmount: z.number().min(1, 'Increment amount must be greater than 0'),
        HRESI_IncrementPercentage: z.number().min(0, 'Percentage cannot be negative').max(100, 'Percentage cannot exceed 100').optional(),
        HRESI_EffectiveDate: z.date({
            required_error: 'Effective date is required'
        }),
        HRESI_Remarks: z.string().optional(),
        HRESI_ActiveFlg: z.boolean().default(true),
        LogInUserId: z.number().optional()
    })
};
