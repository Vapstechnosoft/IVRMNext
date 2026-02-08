import { z } from 'zod';

export const sportHouseCommitteeReportSchema = z.object({
    asmaY_Id: z.coerce.number().min(1, 'Select Academic Year'),
    spccmH_Id: z.array(z.coerce.number()).min(1, 'Select at least one House'),
});

export type SportHouseCommitteeReportFormData = z.infer<typeof sportHouseCommitteeReportSchema>;
