import { z } from 'zod';
import { createStringSchema, deleteIdSchema } from '../../validationSchemas';

export const loginSchema = z.object({
    email: z.string({ message: 'Email is required' }).email({ message: 'Invalid email address' }),
    password: createStringSchema('Password', 6, 50)
});

export const masterClassSchema = {
    addOrUpdate: z.object({
        id: z.number().int({ message: 'Id is required' }).optional(),
        name: createStringSchema('Name', 2, 50),
        description: createStringSchema('Description', 2, 100),
        cost: z.number().int({ message: 'Cost is required' }).optional(),
        value_id: z.number().int({ message: 'Value is required' }),
        multi_value_ids: z.array(z.string()).nonempty('Please at least one brand')
    }),
    delete: z.object({
        asmcL_Id: deleteIdSchema('asmcL_Id')
    })
};
