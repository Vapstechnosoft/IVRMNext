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
