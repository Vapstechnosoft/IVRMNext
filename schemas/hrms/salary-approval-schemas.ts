import { z } from 'zod';

/**
 * Salary Approval Schema
 * Requirements:
 * - Group Type – Not mandatory
 * - Department – Not mandatory
 * - Designation – Not mandatory
 * - Month – Not mandatory
 * - Year – Not mandatory
 */
export const salaryApprovalSchema = {
    search: z.object({
        HRES_Year: z.string().optional(),
        HRES_Month: z.string().optional(),
        groupTypeIdList: z.array(z.number()).optional(),
        hrmD_IdList: z.array(z.number()).optional(),
        hrmdeS_IdList: z.array(z.number()).optional()
    })
};
