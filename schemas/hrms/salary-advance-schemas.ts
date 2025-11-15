import { z } from 'zod';

/**
 * Salary Advance Schemas
 */
export const salaryAdvanceSchema = {
    addOrUpdate: z.object({
        HRESA_Id: z.number().optional(),
        MI_Id: z.number(),
        HRME_Id: z.number().min(1, 'Please select an employee'),
        HRESA_Amount: z.number().min(1, 'Advance amount must be greater than 0'),
        HRESA_AdvanceDate: z.date({
            required_error: 'Advance date is required'
        }),
        HRESA_Remarks: z.string().optional(),
        HRESA_ActiveFlg: z.boolean().default(true),
        LogInUserId: z.number().optional()
    })
};
