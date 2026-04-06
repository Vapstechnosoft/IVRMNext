import { z } from 'zod';

export const SophiaSmartcardReportSchema = z.object({
    ASMAY_Id: z.number().min(1, 'Please select Academic Year'),
    ASMCL_Id: z.number().min(1, 'Please select Class'),
    ASMC_Id: z.number().min(1, 'Please select Section'),
    Admnoallind: z.enum(['Regular', 'New']),
});

export type SophiaSmartcardReportFields = z.infer<typeof SophiaSmartcardReportSchema>;
