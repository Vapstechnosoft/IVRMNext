import { z } from 'zod';

export const CbsStudentTcSchema = z.object({
    reporttype: z.enum(['All', 'indi']).default('All'),
    temporper: z.enum(['Temp', 'Per']).default('Per'),
    asmaY_Id: z.number().min(1, 'Please select a academic year'),
    amsT_Id: z.any().optional(), // Can be a student object or ID
    asmcL_Id: z.number().optional(),
    asmS_Id: z.number().optional(),
    BSPID: z.string().optional(),
    Boardtype: z.enum(['ISC', 'ICSE']).default('ICSE'),
    resulttype: z.string().optional(),
}).refine((data) => {
    if (data.reporttype === 'indi') {
        return !!data.asmcL_Id && !!data.asmS_Id && !!data.amsT_Id;
    }
    return true;
}, {
    message: 'Please select class, section, and student for individual report',
    path: ['amsT_Id']
});

export type CbsStudentTcFields = z.infer<typeof CbsStudentTcSchema>;
