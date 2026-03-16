import { z } from 'zod';

export const sportsYearEndReportSchema = z.object({
    type: z.string().default('AY'),
    asmaY_Id: z.coerce.number().min(1, 'Select Academic Year'),
    selectedClasslist: z.array(z.object({ asmcL_Id: z.number() })).optional().default([]),
    selectedSectionlist: z.array(z.object({ asmS_Id: z.number() })).optional().default([]),
});

export type SportsYearEndReportFormData = z.infer<typeof sportsYearEndReportSchema>;
