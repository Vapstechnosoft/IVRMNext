import { z } from 'zod';

export const StjamesBonafiedReportSchema = z.object({
    allorindi: z.enum(['A', 'I']),
    optradio: z.enum(['S', 'L', 'D', '12']),
    ASMAY_Id: z.number().min(1, 'Please select Academic Year'),
    ASMCL_Id: z.number().optional(),
    ASMS_Id: z.number().optional(),
    AMST_Id: z.number().min(1, 'Please select Student'),
    ASA_FromDate: z.date({ required_error: 'Please select Date' }),
}).refine((data) => {
    if (data.allorindi === 'I') {
        return !!data.ASMCL_Id && !!data.ASMS_Id;
    }
    return true;
}, {
    message: 'Please select Class and Section for individual report',
    path: ['ASMCL_Id']
});

export type StjamesBonafiedReportFields = z.infer<typeof StjamesBonafiedReportSchema>;
