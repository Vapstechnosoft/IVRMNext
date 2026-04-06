import { z } from 'zod';

export const cbsNoObjectionCertSchema = z.object({
    allorindi: z.string().default('A'),
    optradio: z.string().default('S'),
    asmaY_Id: z.coerce.number().min(1, { message: 'Select Academic Year' }),
    asmcL_Id: z.coerce.number().optional(),
    asmS_Id: z.coerce.number().optional(),
    date: z.date({ required_error: 'Select Date' }),
    amsT_Id: z.coerce.number().min(1, { message: 'Select Student' }),
});

export type TCbsNoObjectionCertSchema = z.infer<typeof cbsNoObjectionCertSchema>;
