import { z } from 'zod';

export const masterCompetitionCategorySchema = z.object({
    SPCCMCC_Id: z.number().optional(),
    SPCCMCC_CompitionCategory: z.string().min(5, "Competition Category must be at least 5 characters").max(100, "Competition Category must be at most 100 characters"),
    SPCCMCC_CCDesc: z.string().min(1, "Description is required").max(250, "Description must be at most 250 characters"),
    SPCCMCC_CCAgeFlag: z.boolean().default(false),
    SPCCMCC_CCWeightFlag: z.boolean().default(false),

    // Age details
    SPCCMCC_FromCCAgeYear: z.coerce.number().min(0).optional().nullable(),
    SPCCMCC_ToCCAgeYear: z.coerce.number().min(0).optional().nullable(),
    SPCCMCC_FromCCAgeMonth: z.coerce.number().min(0).max(12, "Month must be between 0 and 12").optional().nullable(),
    SPCCMCC_ToCCAgeMonth: z.coerce.number().min(0).max(12, "Month must be between 0 and 12").optional().nullable(),
    SPCCMCC_FromCCAgeDays: z.coerce.number().min(0).max(31, "Days must be between 0 and 31").optional().nullable(),
    SPCCMCC_ToCCAgeDays: z.coerce.number().min(0).max(31, "Days must be between 0 and 31").optional().nullable(),

    // Weight details
    SPCCMCC_CCWeight: z.coerce.number().min(0).optional().nullable(),

    SPCCMCC_ActiveFlag: z.boolean().default(true).optional(),

    // Audit fields (optional)
    CreatedDate: z.string().optional(),
    UpdatedDate: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.SPCCMCC_CCAgeFlag) {
        if (data.SPCCMCC_FromCCAgeYear === undefined || data.SPCCMCC_FromCCAgeYear === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "From Year is required when Age Flag is checked",
                path: ["SPCCMCC_FromCCAgeYear"],
            });
        }
        if (data.SPCCMCC_ToCCAgeYear === undefined || data.SPCCMCC_ToCCAgeYear === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "To Year is required when Age Flag is checked",
                path: ["SPCCMCC_ToCCAgeYear"],
            });
        }
        if (data.SPCCMCC_FromCCAgeMonth === undefined || data.SPCCMCC_FromCCAgeMonth === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "From Month is required when Age Flag is checked",
                path: ["SPCCMCC_FromCCAgeMonth"],
            });
        }
        if (data.SPCCMCC_ToCCAgeMonth === undefined || data.SPCCMCC_ToCCAgeMonth === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "To Month is required when Age Flag is checked",
                path: ["SPCCMCC_ToCCAgeMonth"],
            });
        }
        if (data.SPCCMCC_FromCCAgeDays === undefined || data.SPCCMCC_FromCCAgeDays === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "From Days is required when Age Flag is checked",
                path: ["SPCCMCC_FromCCAgeDays"],
            });
        }
        if (data.SPCCMCC_ToCCAgeDays === undefined || data.SPCCMCC_ToCCAgeDays === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "To Days is required when Age Flag is checked",
                path: ["SPCCMCC_ToCCAgeDays"],
            });
        }

        // Range Validations
        if (data.SPCCMCC_FromCCAgeYear != null && data.SPCCMCC_ToCCAgeYear != null) {
            if (data.SPCCMCC_ToCCAgeYear <= data.SPCCMCC_FromCCAgeYear) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "To Year must be greater than From Year",
                    path: ["SPCCMCC_ToCCAgeYear"],
                });
            }
        }

        if (data.SPCCMCC_FromCCAgeMonth != null && data.SPCCMCC_ToCCAgeMonth != null) {
            if (data.SPCCMCC_ToCCAgeMonth < data.SPCCMCC_FromCCAgeMonth) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "To Month must be greater than or equal to From Month",
                    path: ["SPCCMCC_ToCCAgeMonth"],
                });
            }
        }

        if (data.SPCCMCC_FromCCAgeDays != null && data.SPCCMCC_ToCCAgeDays != null) {
            if (data.SPCCMCC_ToCCAgeDays < data.SPCCMCC_FromCCAgeDays) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "To Days must be greater than or equal to From Days",
                    path: ["SPCCMCC_ToCCAgeDays"],
                });
            }
        }
    }

    if (data.SPCCMCC_CCWeightFlag) {
        if (data.SPCCMCC_CCWeight === undefined || data.SPCCMCC_CCWeight === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Weight is required when Weight Flag is checked",
                path: ["SPCCMCC_CCWeight"],
            });
        }
    }
});

export type IMasterCompetitionCategory = z.infer<typeof masterCompetitionCategorySchema>;
