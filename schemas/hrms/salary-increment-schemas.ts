import { z } from 'zod';

/**
 * Salary Increment Schemas
 * Requirements:
 * - Employee – Mandatory
 * - Increment Date – Mandatory – Calendar
 * - Head – Mandatory
 * - Increment Type – Not Mandatory – Radio buttons - "Percentage" and "Amount"
 * - Percentage – decimal – (5,2)
 * - Remarks – Text box – 256 characters
 */
export const salaryIncrementSchema = {
    addOrUpdate: z
        .object({
            HRESI_Id: z.number().optional(),
            MI_Id: z.number(),
            HRME_Id: z.number().min(1, 'Employee is required'),
            HRESI_EffectiveDate: z.date({
                required_error: 'Increment Date is required'
            }),
            HRMED_Id: z.number().min(1, 'Head is required'),
            HRESI_IncrementType: z.enum(['Percentage', 'Amount']).optional(),
            HRESI_IncrementAmount: z.number().min(0, 'Amount cannot be negative').optional(),
            HRESI_IncrementPercentage: z
                .number()
                .min(0, 'Percentage cannot be negative')
                .max(100, 'Percentage cannot exceed 100')
                .refine((val) => {
                    const str = val.toString();
                    const parts = str.split('.');
                    return parts[0].length <= 3 && (parts[1]?.length || 0) <= 2;
                }, 'Percentage must be in decimal format (5,2)')
                .optional(),
            HRESI_Remarks: z.string().max(256, 'Remarks must not exceed 256 characters').optional().or(z.literal('')),
            HRESI_ActiveFlg: z.boolean().default(true),
            LogInUserId: z.number().optional()
        })
        .refine(
            (data) => {
                // If increment type is Percentage, percentage must be provided
                if (data.HRESI_IncrementType === 'Percentage' && (!data.HRESI_IncrementPercentage || data.HRESI_IncrementPercentage <= 0)) {
                    return false;
                }
                // If increment type is Amount, amount must be provided
                if (data.HRESI_IncrementType === 'Amount' && (!data.HRESI_IncrementAmount || data.HRESI_IncrementAmount <= 0)) {
                    return false;
                }
                return true;
            },
            {
                message: 'Please provide a valid value based on the selected Increment Type',
                path: ['HRESI_IncrementType']
            }
        )
};
