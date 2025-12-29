import { z } from 'zod';

export const cumulativereportSchema = {
    addOrUpdate: z
        .object({
            emE_ID: z.number().optional(),
            mI_Id: z.number().optional(),

            // Core Dropdowns
            asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),

            asmcL_Id: z.number({ required_error: 'Class  is required' }).min(1, { message: 'Please select Class ' }),

            asmS_Id: z.number({ required_error: 'Section is required' }).min(1, { message: 'Please select  Section' }),

            emE_Id: z.number({ required_error: 'Exam Name is required' }).min(1, { message: 'Please select a Exam Name' }),

            studentList: z
                .array(
                    z.object({
                        amsT_Id: z.number({ required_error: 'Student is required' }).min(1, { message: 'Please select a Students' })
                    })
                )
                .min(1, { message: 'At least one Student must be selected' }),

            // Flags & Remarks
            applicableFlag: z.boolean().default(true).optional(),
            nonApplicableFlag: z.boolean().default(true).optional()
        })
        .superRefine((data, ctx) => {
            // Disallow duplicate subjects
            const studentIds = data.studentList?.map((s) => s.amsT_Id) || [];
            if (new Set(studentIds).size !== studentIds.length) {
                ctx.addIssue({
                    path: ['studentList'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Students are not allowed'
                });
            }
        })
};

export const vvehpc_examreportcardSchema = {
    addOrUpdate: z
        .object({
            emE_ID: z.number().optional(),
            mI_Id: z.number().optional(),

            // Core Dropdowns
            asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),

            asmcL_Id: z.number({ required_error: 'Class  is required' }).min(1, { message: 'Please select Class ' }),

            asmS_Id: z.number({ required_error: 'Section is required' }).min(1, { message: 'Please select  Section' }),

            emE_Id: z.number({ required_error: 'Exam Name is required' }).min(1, { message: 'Please select a Exam Name' }),

            studentList: z
                .array(
                    z.object({
                        amsT_Id: z.number({ required_error: 'Student is required' }).min(1, { message: 'Please select a Students' })
                    })
                )
                .min(1, { message: 'At least one Student must be selected' })
        })
        .superRefine((data, ctx) => {
            // Disallow duplicate subjects
            const studentIds = data.studentList?.map((s) => s.amsT_Id) || [];
            if (new Set(studentIds).size !== studentIds.length) {
                ctx.addIssue({
                    path: ['studentList'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Students are not allowed'
                });
            }
        })
};

export const examelectivesreportSchema = {
    addOrUpdate: z.object({
        asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),

        Type: z.enum(['All', 'Indi', 'subj', 'csw'], {
            required_error: 'Report Type is required'
        }),

        emcA_Id: z.union([z.number(), z.literal('All')]).optional(),

        emG_Id: z.number().optional(),
        ismS_Id: z.number().optional(),
        asmcL_Id: z.number().optional(),
        asmS_Id: z.number().optional(),

        mob_flg: z.boolean().optional(),
        mail_flg: z.boolean().optional(),
        Left_Flag: z.boolean().optional(),
        Deactive_Flag: z.boolean().optional()
    })
};

export const examCategoryReportSchema = z
    .object({
        type: z.enum(['1', '2']), // 1=All, 2=Individual
        asmaY_Id: z.string().min(1, { message: 'Select Academic Year' }),
        emcA_Id: z.string().optional()
    })
    .superRefine((data, ctx) => {
        if (data.type === '2' && (!data.emcA_Id || data.emcA_Id === '')) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Select Category',
                path: ['emcA_Id']
            });
        }
    });

export type ExamCategoryReportFormValues = z.infer<typeof examCategoryReportSchema>;

export const examMonthEndReportSchema = z.object({
    ASMAY_Id: z.string().min(1, { message: 'Academic Year is required' }),
    IVRM_Month_Id: z.string().min(1, { message: 'Month is required' }),
    EME_Id: z.string().min(1, { message: 'Exam is required' }),
    iename: z.string().optional(),
    radiodata: z.string().default('All')
});

export type ExamMonthEndReportFormValues = z.infer<typeof examMonthEndReportSchema>;

export const tbs_reportschoolSchema = {
    addOrUpdate: z
        .object({
            asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
            asmcL_Id: z.number({ required_error: 'Class is required' }).min(1, { message: 'Please select Class' }),
            asmS_Id: z.number({ required_error: 'Section is required' }).min(1, { message: 'Please select Section' }),
            emE_Id: z
                .array(
                    z.object({
                        emE_Id: z.number()
                    })
                )
                .min(1, { message: 'Select at least one Exam' }),
            emgR_Id: z.number({ required_error: 'Grade is required' }).min(1, { message: 'Please select Grade' }),
            studentList: z
                .array(
                    z.object({
                        amsT_Id: z.number()
                    })
                )
                .min(1, { message: 'Select at least one Student' }),
            // Fee-related fields (optional)
            feeGroupIds: z.array(z.number()).optional().default([]),
            feeTermIds: z.array(z.number()).optional().default([]),
            feeClassIds: z.array(z.number()).optional().default([]),
            feeSectionIds: z.array(z.number()).optional().default([]),
            feeBusRouteIds: z.array(z.number()).optional().default([]),
            feeCustomGroupIds: z.array(z.number()).optional().default([])
        })
        .superRefine((data, ctx) => {
            // Validate no duplicate students
            const studentIds = data.studentList?.map((s) => s.amsT_Id) || [];
            if (new Set(studentIds).size !== studentIds.length) {
                ctx.addIssue({
                    path: ['studentList'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Students are not allowed'
                });
            }

            // Validate no duplicate exams
            const examIds = data.emE_Id?.map((e) => e.emE_Id) || [];
            if (new Set(examIds).size !== examIds.length) {
                ctx.addIssue({
                    path: ['emE_Id'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Exams are not allowed'
                });
            }

            // Validate no duplicate fee groups
            if (data.feeGroupIds && new Set(data.feeGroupIds).size !== data.feeGroupIds.length) {
                ctx.addIssue({
                    path: ['feeGroupIds'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Fee Groups are not allowed'
                });
            }

            // Validate no duplicate fee terms
            if (data.feeTermIds && new Set(data.feeTermIds).size !== data.feeTermIds.length) {
                ctx.addIssue({
                    path: ['feeTermIds'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Fee Terms are not allowed'
                });
            }

            // Validate no duplicate fee classes
            if (data.feeClassIds && new Set(data.feeClassIds).size !== data.feeClassIds.length) {
                ctx.addIssue({
                    path: ['feeClassIds'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Fee Classes are not allowed'
                });
            }

            // Validate no duplicate fee sections
            if (data.feeSectionIds && new Set(data.feeSectionIds).size !== data.feeSectionIds.length) {
                ctx.addIssue({
                    path: ['feeSectionIds'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Fee Sections are not allowed'
                });
            }

            // Validate no duplicate bus routes
            if (data.feeBusRouteIds && new Set(data.feeBusRouteIds).size !== data.feeBusRouteIds.length) {
                ctx.addIssue({
                    path: ['feeBusRouteIds'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Bus Routes are not allowed'
                });
            }

            // Validate no duplicate custom groups
            if (data.feeCustomGroupIds && new Set(data.feeCustomGroupIds).size !== data.feeCustomGroupIds.length) {
                ctx.addIssue({
                    path: ['feeCustomGroupIds'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Custom Groups are not allowed'
                });
            }
        })
};
