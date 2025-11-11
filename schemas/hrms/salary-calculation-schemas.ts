import { z } from 'zod';

/**
 * Salary Calculation Schema
 */
export const salaryCalculationSchema = {
    generate: z.object({
        MI_Id: z.number(),
        HRES_Year: z.string().min(1, 'Please select year'),
        HRES_Month: z.string().min(1, 'Please select month'),
        employeeIdList: z.array(z.number()).min(1, 'Please select at least one employee'),
        LogInUserId: z.number().optional()
    })
};
