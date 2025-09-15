import { z } from 'zod';
import { createStringSchema, deleteIdSchema } from '../../validationSchemas';

export const loginSchema = z.object({
    email: z.string({ message: 'Email is required' }).email({ message: 'Invalid email address' }),
    password: createStringSchema('Password', 6, 50)
});

export const masterClassSchema = {
    addOrUpdate: z.object({
        id: z.number().int({ message: 'Id is required' }).optional(),
        code: createStringSchema('Code', 2, 50),
        name: createStringSchema('Name', 2, 50),
        active_flag: z.boolean({ message: 'Active Flag is required' }).optional()
    }),
    delete: z.object({
        id: deleteIdSchema('id')
    })
};
