import { createStringSchema, deleteIdSchema } from '@/schemas/validationSchemas';
import { z } from 'zod';
export const masterStudentCountReportSchema = {
    addOrUpdate: z.object({
        imcC_Id: z.number().int({ message: 'IMCC_ID is required' }).optional(),
        imcC_CategoryCode: z.string().nonempty({ message: 'Caste Category Code is required' }),
        imcC_CategoryName: createStringSchema('Caste Category Code', 1, 50),
        imcC_CategoryDesc: createStringSchema('Caste Category Description', 1, 500)
    }),
    delete: z.object({
        imcC_Id: deleteIdSchema('imcC_Id')
    })
};
