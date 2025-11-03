import { z } from 'zod';

/**
 * Religion-Category Mapping Schema
 */
export const religionCategoryMappingSchema = {
    addOrUpdate: z.object({
        IMRCC_Id: z.number().optional(),
        MI_Id: z.number(),
        IVRMMR_Id: z.number().min(1, 'Please select a religion'),
        IMCC_Id: z.number().optional(),
        categoryids: z.array(z.number()).min(1, 'Please select at least one category'),
        IMRCC_ActiveFlag: z.boolean().default(true),
        IMRCC_CreatedBy: z.number().optional(),
        LogInUserId: z.number().optional()
    })
};
