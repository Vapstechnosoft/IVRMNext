import { createStringOnlySchema, deleteIdSchema } from '@/schemas/validationSchemas';
import { z } from 'zod';

export const timeTableGenerationSchema = z.object({
    asmaY_Id: z.string().min(1, 'Academic Year is required'),
    ttmC_Id: z.string().min(1, 'Category Name is required'),
    hrmE_Id: z.string().min(1, 'Total No Of period Not allotted'),
    asmcL_Id: z.string().min(1, 'Total Number of Periods'),
    asms_Id: z.string().optional(),
    notConfirmedPeriods: z.string().optional(),
});
// const schema = z.object({
//     hrmE_Id: z.string().min(1, "Please select a staff member"),
// });

export const ttGenerationSchema = {
    addOrUpdate: z.object({
        ttmD_Id: z.number().optional(),
        ttmD_DayName: createStringOnlySchema('Day Name', 1, 100),
        ttmD_DayCode: createStringOnlySchema('Day Code', 1, 100)
    }),
    delete: z.object({
        ttfG_Id: deleteIdSchema('ttfG_Id')
    })
};

export type TimeTableGenerationValues = z.infer<typeof timeTableGenerationSchema>;
