import { deleteIdSchema } from '@/schemas/validationSchemas';
import { z } from 'zod';

export const masterClassSchema = {
    addOrUpdate: z.object({
        asmcl_id: z.number().optional(),
        asmcl_classcode: z.string().min(1, { message: 'Class Category Code is required' }),
        asmcl_classname: z.string().min(1, { message: 'Class Category Name is required' })
    }),
    delete: z.object({
        asmS_Id: deleteIdSchema('asmS_Id')
    })
};
