import { z } from 'zod';

export const cbsStudyCertificateSchema = z.object({
    allorindi: z.string().default('A'),
    optradio: z.string().default('S'),
    character: z.string().default('0'), // 1: Character, 0: Study, 2: No Objection
    asmaY_Id: z.coerce.number().min(1, 'Please select a academic year'),
    asmcL_Id: z.coerce.number().optional(),
    asmS_Id: z.coerce.number().optional(),
    boardType: z.string().default('ICSE'),
    charType: z.string().default('satisfactory'),
    date: z.date({ required_error: 'Please select a date' }),
    amsT_Id: z.coerce.number().optional(),
    address_opt: z.string().default('address_per'),
    paretsnamefather: z.string().default('0'),
});


export type TCbsStudyCertificateSchema = z.infer<typeof cbsStudyCertificateSchema>;
