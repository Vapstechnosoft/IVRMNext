import { z } from 'zod';

export const cbsStudyCertificateSchema = z.object({
    allorindi: z.string().default('A'),
    optradio: z.string().default('S'),
    character: z.string().default('0'), // 1: Character, 0: Study
    asmaY_Id: z.coerce.number().min(1, { message: 'Select Academic Year' }),
    asmcL_Id: z.coerce.number().optional(),
    asmS_Id: z.coerce.number().optional(),
    boardType: z.string().default('ICSE'),
    charType: z.string().default('satisfactory'),
    date: z.date({ required_error: 'Select Date' }),
    amsT_Id: z.coerce.number().min(1, { message: 'Select Student' }),
    address_opt: z.string().default('address_per'),
    paretsnamefather: z.string().default('0'), // 0: Father, 1: Mother, 2: Both
});

export type TCbsStudyCertificateSchema = z.infer<typeof cbsStudyCertificateSchema>;
