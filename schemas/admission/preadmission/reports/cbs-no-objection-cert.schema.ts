import { z } from 'zod';

export const cbsNoObjectionCertSchema = z.object({
    allorindi: z.string().default('A'),
    optradio: z.string().default('S'),
    asmaY_Id: z.coerce.number().min(1, { message: 'please select academic year' }),
    asmcL_Id: z.coerce.number().optional().default(0),
    asmS_Id: z.coerce.number().optional().default(0),
    date: z.date({ required_error: 'please select date' }),
    amsT_Id: z.coerce.number().min(1, { message: 'please select student' }),
}).superRefine((data, ctx) => {
    if (data.allorindi === 'I') {
        if (!data.asmcL_Id || data.asmcL_Id === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'please select class',
                path: ['asmcL_Id'],
            });
        }
        if (!data.asmS_Id || data.asmS_Id === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'please select section',
                path: ['asmS_Id'],
            });
        }
    }
});

export type TCbsNoObjectionCertSchema = z.infer<typeof cbsNoObjectionCertSchema>;
