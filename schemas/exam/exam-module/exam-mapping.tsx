import { z } from 'zod';

export const examLoginPrivilegesSchema = {
    addOrUpdate: z
        .object({
            elp_Id: z.number().optional(),

            // Core Dropdowns
            asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select an Academic Year' }),

            hrmE_Id: z.number({ required_error: 'Employee is required' }).min(1, { message: 'Please select an Employee' }),

            ivrmulF_Id: z.number({ required_error: 'User Login is required' }).min(1, { message: 'Please select a User Login' }),

            asmcL_Id: z.number({ required_error: 'Class is required' }).min(1, { message: 'Please select a Class' }),

            // Multi selections
            sectionList: z
                .array(
                    z.object({
                        asmS_Id: z.number({ required_error: 'Section is required' }).min(1, { message: 'Please select a Section' })
                    })
                )
                .min(1, { message: 'At least one section must be selected' }),

            subjectList: z
                .array(
                    z.object({
                        ismS_Id: z.number({ required_error: 'Subject is required' }).min(1, { message: 'Please select a Subject' })
                    })
                )
                .min(1, { message: 'At least one subject must be selected' }),

            subSubjectList: z
                .array(
                    z.object({
                        issS_Id: z.number({ required_error: 'Sub-subject is required' }).min(1, { message: 'Please select a Sub-subject' })
                    })
                )
                .optional(),

            // Type
            entryType: z.string({ required_error: 'Entry Type is required' }).nonempty({ message: 'Please select an Entry Type' }),

            // Flags & Remarks
            elp_ActiveFlag: z.boolean().default(true),

            remarks: z.string().max(250, { message: 'Remarks cannot exceed 250 characters' }).optional()
        })
        .superRefine((data, ctx) => {
            // Cross validation rules

            // Must have at least one section or subject
            if ((!data.sectionList || data.sectionList.length === 0) && (!data.subjectList || data.subjectList.length === 0)) {
                ctx.addIssue({
                    path: ['sectionList'],
                    code: z.ZodIssueCode.custom,
                    message: 'At least one Section or Subject must be selected'
                });
            }

            // Disallow duplicate sections
            const sectionIds = data.sectionList?.map((s) => s.asmS_Id) || [];
            if (new Set(sectionIds).size !== sectionIds.length) {
                ctx.addIssue({
                    path: ['sectionList'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate sections are not allowed'
                });
            }

            // Disallow duplicate subjects
            const subjectIds = data.subjectList?.map((s) => s.ismS_Id) || [];
            if (new Set(subjectIds).size !== subjectIds.length) {
                ctx.addIssue({
                    path: ['subjectList'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate subjects are not allowed'
                });
            }

            // Disallow duplicate sub-subjects (if present)
            const subIds = data.subSubjectList?.map((s) => s.issS_Id) || [];
            if (subIds.length > 0 && new Set(subIds).size !== subIds.length) {
                ctx.addIssue({
                    path: ['subSubjectList'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate sub-subjects are not allowed'
                });
            }
        }),

    delete: z.object({
        elp_Id: z.number({ required_error: 'elp_Id is required' })
    })
};

const parseDate = (val: unknown) => {
    if (typeof val === 'string' && val.trim() !== '') {
        const t = Date.parse(val);
        return Number.isNaN(t) ? null : new Date(t);
    }
    if (val instanceof Date) return val;
    return null;
};

export const yearlyCategoryDatesMappingSchema = {
    addOrUpdate: z
        .object({
            ycdm_Id: z.number().optional().default(0),
            asmaY_Id: z.number().min(1, { message: 'Academic Year is required' }),
            emcA_Id: z.number().min(1, { message: 'Category is required' }),
            ycdm_ExamStartDate: z
                .string()
                .nonempty({ message: 'Exam start date is required' })
                .refine((v) => parseDate(v) !== null, { message: 'Exam start date must be a valid date' }),
            ycdm_MarksEntryLastDate: z
                .string()
                .nonempty({ message: 'Marks entry last date is required' })
                .refine((v) => parseDate(v) !== null, { message: 'Marks entry last date must be a valid date' }),
            ycdm_MarksPublishDate: z
                .string()
                .nonempty({ message: 'Marks publish date is required' })
                .refine((v) => parseDate(v) !== null, { message: 'Marks publish date must be a valid date' }),
            ycdm_StartDate: z
                .string()
                .nonempty({ message: 'Mapping start date is required' })
                .refine((v) => parseDate(v) !== null, { message: 'Mapping start date must be a valid date' }),
            ycdm_EndDate: z
                .string()
                .nonempty({ message: 'Mapping end date is required' })
                .refine((v) => parseDate(v) !== null, { message: 'Mapping end date must be a valid date' }),
            ycdm_ActiveFlg: z.boolean().default(true),
            remarks: z.string().optional()
        })
        .refine(
            (data) => {
                const start = parseDate(data.ycdm_StartDate);
                const end = parseDate(data.ycdm_EndDate);
                if (!start || !end) return true;
                return start.getTime() <= end.getTime();
            },
            { path: ['ycdm_StartDate'], message: 'Mapping start date cannot be after mapping end date' }
        )
        .refine(
            (data) => {
                const marksEntryLast = parseDate(data.ycdm_MarksEntryLastDate);
                const marksPublish = parseDate(data.ycdm_MarksPublishDate);
                if (!marksEntryLast || !marksPublish) return true;
                return marksEntryLast.getTime() <= marksPublish.getTime();
            },
            { path: ['ycdm_MarksEntryLastDate'], message: 'Marks entry last date cannot be after marks publish date' }
        )
        .refine(
            (data) => {
                const examStart = parseDate(data.ycdm_ExamStartDate);
                const marksEntryLast = parseDate(data.ycdm_MarksEntryLastDate);
                if (!examStart || !marksEntryLast) return true;
                return examStart.getTime() <= marksEntryLast.getTime();
            },
            { path: ['ycdm_ExamStartDate'], message: 'Exam start date cannot be after marks entry last date' }
        ),

    delete: z.object({
        ycdm_Id: z.number().min(1, { message: 'Id is required to delete' })
    })
};
