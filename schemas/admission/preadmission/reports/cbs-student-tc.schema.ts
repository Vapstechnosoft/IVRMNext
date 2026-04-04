import { z } from 'zod';

export const CbsStudentTcSchema = z.object({
    reporttype: z.enum(['All', 'indi']).default('All'),
    temporper: z.enum(['Temp', 'Per']).default('Per'),
    asmaY_Id: z.number().min(1, 'Please select a academic year'),
    amsT_Id: z.any().refine((v) => !!v, { message: 'Please select a student' }),
    asmcL_Id: z.number().optional(),
    asmS_Id: z.number().optional(),
    BSPID: z.string().optional(),
    Boardtype: z.enum(['ISC', 'ICSE']).default('ICSE'),
    resulttype: z.string().optional(),
    search: z.string().optional(),
    Previous_School_Name: z.string().min(1, 'Please enter previous school name'),
});

export type CbsStudentTcFields = z.infer<typeof CbsStudentTcSchema>;
