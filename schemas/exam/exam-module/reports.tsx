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
                .min(1, { message: 'Select at least one Student' })
        })
        .superRefine((data, ctx) => {
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


