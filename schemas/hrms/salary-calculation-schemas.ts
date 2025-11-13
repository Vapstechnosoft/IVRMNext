import { z } from 'zod';

/**
 * Salary Calculation Schema
 * Requirements:
 * - Group type – Not mandatory
 * - Department – Not mandatory
 * - Designation – Not mandatory
 * - Month – Not mandatory
 * - Year – Not mandatory
 */
export const salaryCalculationSchema = {
    search: z.object({
        HRES_Year: z.string().optional(),
        HRES_Month: z.string().optional(),
        groupTypeIdList: z.array(z.number()).optional(),
        hrmD_IdList: z.array(z.number()).optional(),
        hrmdeS_IdList: z.array(z.number()).optional()
    }),
    generate: z.object({
        MI_Id: z.number(),
        HRES_Year: z.string().optional(),
        HRES_Month: z.string().optional(),
        employeeIdList: z.array(z.number()).min(1, 'Please select at least one employee'),
        LogInUserId: z.number().optional()
    })
};
