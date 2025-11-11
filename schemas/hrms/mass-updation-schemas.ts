import { z } from 'zod';

/**
 * Mass Updation Schemas
 */
export const massUpdationSchema = {
    search: z.object({
        HRMGT_Id: z.number().optional(),
        HRMD_Id: z.number().optional(),
        HRMDES_Id: z.number().optional(),
        employeeIdList: z.array(z.number()).optional()
    }),
    update: z.object({
        MI_Id: z.number(),
        employeeIdList: z.array(z.number()).min(1, 'Please select at least one employee'),
        fieldName: z.string().min(1, 'Please select field to update'),
        fieldValue: z.union([z.string(), z.number(), z.boolean()]),
        LogInUserId: z.number().optional()
    })
};
