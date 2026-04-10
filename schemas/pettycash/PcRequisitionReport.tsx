import { z } from 'zod';
import { masterParticularsSchema } from './masters';

export const UsePcRequisitionReport = {
    addOrUpdate: z.object({
        pcmparT_ParticularName: z.string().min(1, 'Particular Name is required'),
        pcmparT_ParticularDesc: z.string().optional().or(z.literal(''))
    })
};

export type UsePcRequisitionReport = z.infer<typeof masterParticularsSchema.addOrUpdate>;
    