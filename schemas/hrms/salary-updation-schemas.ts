import { z } from 'zod';

/**
 * Salary Updation Schemas
 */
export const salaryUpdationSchema = {
    addOrUpdate: z
        .object({
            HRESU_Id: z.number().optional(),
            MI_Id: z.number(),
            HRME_Id: z.number().min(1, 'Please select an employee'),
            HRESU_OldSalary: z.number().min(0, 'Old salary cannot be negative'),
            HRESU_NewSalary: z.number().min(1, 'New salary must be greater than 0'),
            HRESU_EffectiveDate: z.date({
                required_error: 'Effective date is required'
            }),
            HRESU_Remarks: z.string().optional(),
            HRESU_ActiveFlg: z.boolean().default(true),
            LogInUserId: z.number().optional()
        })
        .refine((data) => data.HRESU_NewSalary !== data.HRESU_OldSalary, {
            message: 'New salary must be different from old salary',
            path: ['HRESU_NewSalary']
        })
};
