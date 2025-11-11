import { z } from 'zod';

/**
 * Salary Approval Schema
 */
export const salaryApprovalSchema = {
    search: z.object({
        HRES_Year: z.string().min(1, 'Please select year'),
        HRES_Month: z.string().min(1, 'Please select month'),
        groupTypeIdList: z.array(z.number()).optional(),
        hrmD_IdList: z.array(z.number()).optional(),
        hrmdeS_IdList: z.array(z.number()).optional()
    })
};
