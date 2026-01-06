import { z } from 'zod';
import { createStringSchema, deleteIdSchema } from '../validationSchemas';

export const loginSchema = z.object({
    email: z.string({ message: 'Email is required' }),
    password: createStringSchema('Password', 6, 50)
});

export const masterLibrarySchema = {
    addOrUpdate: z.object({
        lmaL_Id: z.number().nonnegative().optional(), // optional when creating new record
        lmaL_LibraryName: z.string({ message: 'Library Name is required' }).min(2).max(100)
    }),
    delete: z.object({
        lmaL_Id: deleteIdSchema('lmaL_Id')
    })
};
