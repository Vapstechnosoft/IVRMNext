import { z } from "zod";

// Master Job Schema
export const recruitmentMasterJobSchema = z.object({
    hrmJ_Id: z.number().optional(),
    hrmJ_JobCode: z
        .string({ message: 'Job Code is required' })
        .min(1, { message: 'Job Code is required' })
        .max(50, { message: 'Job Code must not exceed 20 characters' }),
    hrmJ_JobTiTle: z
        .string({ message: 'Job Title is required' })
        .min(1, { message: 'Job Title is required' })
        .max(100, { message: 'Job Title must not exceed 100 characters' }),
    hrmlO_Id: z.coerce.number({ message: "Job Location is required" }).min(1, 'Job Location is required'),
    hrC_Id: z.number().optional().default(0)
});

// Master Location Schema
export const recruitmentMasterLocationSchema = z.object({
    hrmlO_Id: z.number().optional().default(0),
    hrmlO_Institution: z.string({ message: 'Institution is required' }).min(1, 'Institution is required'),
    hrmlO_LocationName: z.string({ message: 'Location Name is required' }).min(1, 'Location Name is required'),
    hrmlO_LocationDesc: z.string({ message: 'Location Description is required' }).min(1, 'Location Description is required'),
    hrmlO_ActiveFlg: z.boolean().default(true)
});