import { z } from 'zod';
import { createStringSchema } from './validationSchemas';

export const loginSchema = z.object({
    email: z.string({ message: 'Email is required' }).email({ message: 'Invalid email address' }),
    password: createStringSchema('Password', 6, 50)
});
