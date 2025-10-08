import { z } from 'zod';
import { createStringSchema, deleteIdSchema } from '../validationSchemas';

export const loginSchema = z.object({
    email: z.string({ message: 'Email is required' }),
    password: createStringSchema('Password', 6, 50)
});

export const masterFeeheadSchema = {
    addOrUpdate: z.object({
        fmH_Id: z.number().int({ message: 'fmH_Id is required' }).optional(),
        fmH_FeeName: createStringSchema('fmH_FeeName', 1, 100),
        fmH_Order: z.number().int({ message: 'fmH_Order is required' }),
        fmH_Flag: createStringSchema('fmH_Flag', 1, 100)
    }),
    delete: z.object({
        fmH_Id: deleteIdSchema('fmH_Id')
    })
};

export const masterModeOfPaymentSchema = {
    addOrUpdate: z.object({
        ivrmmoD_Id: z.number().int({ message: 'ivrmmoD_Id is required' }).optional(),
        ivrmmoD_ModeOfPayment: createStringSchema('ivrmmoD_ModeOfPayment', 1, 100),
        ivrmmoD_ModeOfPayment_Code: createStringSchema('ivrmmoD_ModeOfPayment_Code', 1, 100)
    }),
    delete: z.object({
        ivrmmoD_Id: deleteIdSchema('ivrmmoD_Id')
    })
};
