import { z } from 'zod';

export const sportsCCNameSchema = {
    addOrUpdate: z.object({
        SPCCMSCC_Id: z.number().optional(),
        SPCCMSCCG_Id: z.number({ required_error: "Group/Main Event is required" }).min(1, "Group/Main Event is required"),
        SPCCMSCC_SportsCCName: z.string({ required_error: "Sports Name is required" }).min(1, "Sports Name is required"),
        SPCCMSCC_SportsCCDesc: z.string({ required_error: "Description is required" }).min(1, "Description is required").max(250, "Description cannot exceed 250 characters"),
        SPCCMSCC_SGFlag: z.enum(["Single", "Group"], { required_error: "SG Flag is required" }),
        SPCCMSCC_NoOfMembers: z.number({ required_error: "No.Of Members is required" }).min(1, "At least 1 member is required"),
        SPCCMSCC_RecHighLowFlag: z.enum(["High", "Low"], { required_error: "High/Low Flag is required" }),
        SPCCMSCC_RecInfo: z.string().optional(),
        SPCCMSCC_MultiAttemptFlg: z.boolean().default(false),
        SPCCMSCC_NoOfAttempts: z.number().optional().nullable(),
        tempDatas: z.array(z.object({
            SPCCMSCCG_Id: z.number().optional(),
            SPCCMSCCG_UnderEvent: z.string().optional() // Allow empty string but maybe filter out later? UI shows it's an input.
        })).optional()
    }).superRefine((data, ctx) => {
        if (data.SPCCMSCC_MultiAttemptFlg && (!data.SPCCMSCC_NoOfAttempts || data.SPCCMSCC_NoOfAttempts < 1)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Number Of Attempts is required when Multi Attempt is checked",
                path: ["SPCCMSCC_NoOfAttempts"]
            });
        }
        if (data.SPCCMSCC_SGFlag === "Single" && data.SPCCMSCC_NoOfMembers !== 1) {
            // We can strictly enforce this or just handle it in UI/Backend.
            // Let's enforce it to be safe.
            // Actually, UI sets it to 1.
        }
    })
};
