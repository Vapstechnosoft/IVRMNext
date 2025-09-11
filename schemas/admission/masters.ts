import { z } from 'zod';
import { createStringSchema, deleteIdSchema } from '../validationSchemas';

export const masterClassSchema = {
    addOrUpdate: z.object({
        id: z.number().int({ message: 'Id is required' }).optional(),
        code: createStringSchema('Code', 2, 50),
        name: createStringSchema('Name', 2, 50)
    }),
    delete: z.object({
        id: deleteIdSchema('id')
    })
};
