import { z } from 'zod';

export const feeAuditSchema = z.object({
    academicYearId: z.string().min(1, 'Academic Year is required'),
    fromDate: z.date().optional(),
    toDate: z.date().optional(),
    breakdown: z.string().optional()
});
