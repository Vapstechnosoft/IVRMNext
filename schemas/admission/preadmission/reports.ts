import { deleteIdSchema } from '@/schemas/validationSchemas';
import { z } from 'zod';

export const masterStudentCountReportSchema = {
    addOrUpdate: z.object({
        type: z.number().default(1),
        report_type: z
            .enum(['Registered List', 'Registered Count', 'Payment Report'], {
                message: 'Report type is required'
            })
            .optional(),
        from_date: z.string().optional(),
        to_date: z.string().optional(),
        asmaY_Id: z.number().int({ message: 'Academic Year ID is required' }).optional(),
        asmcL_Id: z.number().int().default(0)
    }),
    delete: z.object({
        asmay_id: deleteIdSchema('asmay_id')
    })
};
