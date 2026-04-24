import { z } from 'zod';

export const UsePcRequisitionReportSchemas = {
    addOrUpdate: z.object({
        mI_Id: z.number({ required_error: 'Building Name is required' }).min(1, 'Building Name is required'),
    })
};

export type UsePcRequisitionReport = z.infer<typeof UsePcRequisitionReportSchemas.addOrUpdate>;

    