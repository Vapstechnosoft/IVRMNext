import { z } from "zod";

export const masterEventCoeSchema = {
    addOrUpdate: z.object({
        masterevent: z.string().optional(),
        masterDescription: z.string().optional(),
        smsContent: z.string().optional(),
        smsparameter: z.string().optional(),
        emailSubject: z.string().optional(),
        emailHeader: z.string().optional(),
        emailMessage: z.string().optional(),
        eemailParamter: z.string().optional(),
        emailFooter: z.string().optional(),
    }),

    delete: z.object({
        fyghm_id: z.number().min(1, {
            message: 'Valid ID is required for deletion'
        })
    })
};