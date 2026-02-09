import { z } from 'zod';
import { deleteIdSchema } from '../validationSchemas';

export const masterEventCoeSchema = {
    addOrUpdate: z.object({
        masterevent: z.string().min(1, 'Master Event Name is required'),
        masterDescription: z.string().min(1, 'Master Description is required'),
        smsContent: z.string().optional(),
        smsparameter: z.string().optional(),
        emailSubject: z.string().min(1, 'Email Subject is required'),
        emailHeader: z.string().min(1, 'Email Header is required'),
        emailMessage: z.string().optional(),
        eemailParamter: z.string().optional(),
        emailFooter: z.string().min(1, 'Email Footer is required'),
        type: z.enum(['mc', 'dc']).default('mc'),
    }).superRefine((data, ctx) => {
        if (data.type === 'mc') {
            if (!data.smsContent) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "SMS Content is required",
                    path: ["smsContent"]
                });
            }
            if (!data.emailMessage) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Email Message is required",
                    path: ["emailMessage"]
                });
            }
        }
    }),
    delete: z.object({
        coemE_Id: deleteIdSchema('coemE_Id')
    })
};

export const coeReportSchema = {
    addOrUpdate: z.object({
        asmaY_Id: z.number({ required_error: 'Academic year is required' }),
        asmcl_Id: z.number().optional(),
        month: z.number().optional()
    })
};

export const coeMonthEndReportSchema = {
    addOrUpdate: z.object({
        asmaY_Id: z.number({ required_error: 'Academic year is required' }),
        ieName: z.string().optional(),
        month: z.string().optional()
    })
};
