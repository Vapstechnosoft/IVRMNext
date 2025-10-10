import { z } from 'zod';
import { createStringSchema, deleteIdSchema } from '../validationSchemas';

export const loginSchema = z.object({
    email: z.string({ message: 'Email is required' }),
    password: createStringSchema('Password', 6, 50)
});

export const masterFeeheadSchema = {
    addOrUpdate: z.object({
        fmH_Id: z.number().optional(),
        fmH_FeeName: createStringSchema('fmH_FeeName', 1, 100),
        fmH_Order: z.number().int({ message: 'fmH_Order is required' }),
        fmH_Flag: createStringSchema('fmH_Flag', 1, 100),
        fmH_RefundFlag: z.boolean().optional(),
        fmH_PDAFlag: z.boolean().optional(),
        fmH_SpecialFeeFlag: z.boolean().optional()
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

export const paymentgatewaydetailsSchema = {
    addOrUpdate: z.object({
        fpgD_Id: z.number().int({ message: 'fpgD_Id is required' }).optional(),
        fpgD_AuthorisationKey: z.string({ message: 'AuthorisationKey is required' }),
        fpgD_Image: z.string({ message: 'Image is required' }),
        fpgD_MerchantId: z.string({ message: 'erchantId is required' }),
        fpgD_PGName: z.string({ message: 'PGName is required' }),
        fpgD_SaltKey: z.string({ message: 'SaltKey is required' }),
        fpgD_SubMerchantId: z.string({ message: 'SubMerchantId is required' }),
        fpgD_URL: z.string({ message: 'URL is required' }),
        gatewayName: z.string({ message: 'gatewayName is required' }),
        fpgD_AccNo: z.string({ message: 'AccNo is required' })
    }),
    delete: z.object({
        FPGD_Id: deleteIdSchema('FPGD_Id')
    })
};

export const fineslabSchema = {
    addOrUpdate: z
        .object({
            fmfS_Id: z.number().optional(),
            fmfS_FineType: z.enum(['Between', 'GreaterThan', 'LessThan'], {
                message: 'Fine Type is required'
            }),
            fmfS_FromDay: z.number({ message: 'From Day is required' }).optional(),
            fmfS_ToDay: z.number({ message: 'To Day is required' }).optional(),
            fmfS_ECSFlag: z.string({ message: 'ECS Flag is required' }).optional(),
            fmfS_ActiveFlag: z.boolean().optional()
        })
        .superRefine((data, ctx) => {
            const { fmfS_FineType, fmfS_FromDay, fmfS_ToDay } = data;

            if (fmfS_FineType === 'Between') {
                if (typeof fmfS_FromDay !== 'number') {
                    ctx.addIssue({
                        path: ['fmfS_FromDay'],
                        code: z.ZodIssueCode.custom,
                        message: 'Enter From Day'
                    });
                }

                if (typeof fmfS_ToDay !== 'number') {
                    ctx.addIssue({
                        path: ['fmfS_ToDay'],
                        code: z.ZodIssueCode.custom,
                        message: 'Enter To Day'
                    });
                } else if (typeof fmfS_FromDay === 'number' && fmfS_ToDay < fmfS_FromDay) {
                    ctx.addIssue({
                        path: ['fmfS_ToDay'],
                        code: z.ZodIssueCode.custom,
                        message: 'To Day must be greater than or equal to From Day'
                    });
                }
            }

            if (fmfS_FineType === 'GreaterThan' || fmfS_FineType === 'LessThan') {
                if (typeof fmfS_FromDay !== 'number') {
                    ctx.addIssue({
                        path: ['fmfS_FromDay'],
                        code: z.ZodIssueCode.custom,
                        message: 'From Day is required'
                    });
                }
            }
        }),

    delete: z.object({
        fmfS_Id: z.number({ message: 'fmfS_Id is required for deletion' })
    })
};

// export const fineslabSchema = {
//     addOrUpdate: z.object({
//         fmfS_Id: z.number().optional(),
//         fmfS_ToDay: z.number().optional(),
//         fmfS_FromDay: z.number().optional(),
//         fmfS_FineType:z.string().optional(),
//         fmfS_ECSFlag: z.string().optional()
//     }),
//     delete: z.object({
//         fmfS_Id: deleteIdSchema('fmfS_Id')
//     })
// };
