import { z } from 'zod';

export const StthomasTcCustomReportSchema = z.object({
    reporttype: z.enum(['All', 'indi']),
    temporper: z.enum(['Temp', 'Per']),
    ASMAY_Id: z.number().min(1, 'Please select a year'),
    AMST_Id: z.any().optional(),
    ASMCL_Id: z.number().optional(),
    ASMS_Id: z.number().optional()
}).refine((data) => {
    if (data.reporttype === 'indi') {
        return !!data.ASMCL_Id && !!data.ASMS_Id && !!data.AMST_Id;
    }
    return true;
}, {
    message: 'Please select class, section, and student for individual report',
    path: ['AMST_Id']
});

export type StthomasTcCustomReportFields = z.infer<typeof StthomasTcCustomReportSchema>;
