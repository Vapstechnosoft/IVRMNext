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
            eyC_Id: z.number().optional().default(0),
            asmaY_Id: z.number().min(1, { message: 'Academic Year is required' }),
            emcA_Id: z.number().min(1, { message: 'Category is required' }),
            mI_Id: z.number().min(1, { message: 'Organization ID is required' }).default(30),
            eyC_ExamStartDate: z
                .string()
                .nonempty({ message: 'Exam start date is required' })
                .refine((v) => parseDate(v) !== null, { message: 'Exam start date must be valid' }),
            eyC_ExamEndDate: z
                .string()
                .nonempty({ message: 'Exam end date is required' })
                .refine((v) => parseDate(v) !== null, { message: 'Exam end date must be valid' }),
            eyC_MarksEntryLastDate: z
                .string()
                .nonempty({ message: 'Marks entry last date is required' })
                .refine((v) => parseDate(v) !== null, { message: 'Marks entry last date must be valid' }),
            eyC_MarksProcessLastDate: z
                .string()
                .nonempty({ message: 'Marks process last date is required' })
                .refine((v) => parseDate(v) !== null, { message: 'Marks process last date must be valid' }),
            eyC_MarksPublishDate: z
                .string()
                .nonempty({ message: 'Marks publish date is required' })
                .refine((v) => parseDate(v) !== null, { message: 'Marks publish date must be valid' })
        })
        .refine(
            (data) => {
                const examStart = parseDate(data.eyC_ExamStartDate);
                const examEnd = parseDate(data.eyC_ExamEndDate);
                if (!examStart || !examEnd) return true;
                return examStart.getTime() <= examEnd.getTime();
            },
            { path: ['eyC_ExamStartDate'], message: 'Exam start date cannot be after exam end date' }
        )
        .refine(
            (data) => {
                const marksEntry = parseDate(data.eyC_MarksEntryLastDate);
                const marksPublish = parseDate(data.eyC_MarksPublishDate);
                if (!marksEntry || !marksPublish) return true;
                return marksEntry.getTime() <= marksPublish.getTime();
            },
            { path: ['eyC_MarksEntryLastDate'], message: 'Marks entry last date cannot be after marks publish date' }
        )
        .refine(
            (data) => {
                const marksProcess = parseDate(data.eyC_MarksProcessLastDate);
                const marksPublish = parseDate(data.eyC_MarksPublishDate);
                if (!marksProcess || !marksPublish) return true;
                return marksProcess.getTime() <= marksPublish.getTime();
            },
            { path: ['eyC_MarksProcessLastDate'], message: 'Marks process last date cannot be after marks publish date' }
        )
};

export const SubjectListItemSchema = z.object({
    ismS_Id: z.number().int().positive({ message: 'Invalid subject id' })
    // Optional name if needed
    // ISMS_SubjectName: z.string().min(1, { message: 'Subject name required' }),
});

/* ----------------------------- Schema Definition ----------------------------- */
export const ExamSubjectGroupSchema = {
    addOrUpdate: z
        .object({
            esG_Id: z.number().int().nonnegative().optional().nullable(),
            mI_Id: z.number().int().nonnegative().optional(),
            asmaY_Id: z.number().int().positive({ message: 'Select Academic Year' }),
            emcA_Id: z.number().int().positive({ message: 'Select Category' }),
            esG_SubjectGroupName: z
                .string()
                .min(1, { message: 'Enter Group Name' })
                .max(50, { message: 'Group name must be at most 50 characters' })
                .regex(/^[A-Za-z\s-]+$/, {
                    message: 'Group name must contain only letters, spaces or hyphens'
                }),
            esG_ExamPromotionFlag: z.enum(['IE', 'PE']),
            emE_Id: z.number().int().nonnegative({ message: 'Invalid Exam id' }),
            esG_GroupMinMarks: z
                .number()
                .int({ message: 'Min marks must be an integer' })
                .min(0, { message: 'Min marks cannot be less than 0' }),
            esG_GroupMaxMarks: z
                .number()
                .int({ message: 'Max marks must be an integer' })
                .min(0, { message: 'Max marks cannot be less than 0' }),
            esG_CompulsoryFlag: z.enum(['Y', 'N']),
            esG_ActiveFlag: z.boolean(),
            subjects_list: z.array(SubjectListItemSchema).min(2, { message: 'Select at least two subjects for a group' })
        })
        .refine(
            (data) => {
                // If Individual Exam, emE_Id must be > 0
                if (data.esG_ExamPromotionFlag === 'IE') return data.emE_Id > 0;
                return true;
            },
            {
                path: ['emE_Id'],
                message: 'Select Exam for Individual Exam type'
            }
        ),

    delete: z.object({
        ESG_Id: z.number().int().positive({ message: 'Invalid Exam Subject Group ID' })
    })
};

const toNumber = (val: unknown) => {
    if (val === '' || val === null || val === undefined) return Number.NaN;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const n = Number(val);
        return Number.isNaN(n) ? Number.NaN : n;
    }
    return Number.NaN;
};

export const ExamTermAndExamMappingSchema = {
    addOrUpdate: z
        .object({
            mI_Id: z.preprocess(toNumber, z.number().int().nonnegative().optional()),
            ecT_Id: z.preprocess(toNumber, z.number().int().nonnegative().optional().nullable()),

            asmaY_Id: z.preprocess(toNumber, z.number().int().positive({ message: 'Select Academic Year' })),
            emcA_Id: z.preprocess(toNumber, z.number().int().positive({ message: 'Select Category' })),
            emgR_Id: z.preprocess(toNumber, z.number().int().positive({ message: 'Select Grade' })),
            ecT_TermName: z
                .string()
                .min(1, { message: 'Enter Term Name' })
                .max(100, { message: 'Term Name must be at most 100 characters' })
                .regex(/^[A-Za-z0-9\s-]+$/, {
                    message: 'Term Name must contain only letters, numbers, spaces, or hyphens'
                }),

            ecT_TermStartDate: z.string().min(1, { message: 'Select Start Date' }),
            ecT_TermEndDate: z.string().min(1, { message: 'Select End Date' }),
            ecT_MarksPublishDate: z.string().min(1, { message: 'Select Publish Date' }),

            ecT_Marks: z.preprocess(
                toNumber,
                z.number().int({ message: 'Term Marks must be an integer' }).positive({ message: 'Enter Term Marks' })
            ),

            ecT_MinMarks: z.preprocess(
                toNumber,
                z
                    .number()
                    .int({ message: 'Min Marks must be an integer' })
                    .min(0, { message: 'Enter Min Marks' })
                    .max(999, { message: 'Min Marks cannot exceed 999' })
            ),

            // saved exam rows
            exam_term: z
                .array(
                    z.object({
                        emE_Id: z.preprocess(toNumber, z.number().int().positive({ message: 'Select Exam' })),
                        emE_ExamName: z.string().min(1, { message: 'Exam name required' }),
                        ecteX_MarksPerFlag: z.enum(['M', 'P'], { required_error: 'Select Marks or Percentage' }),
                        ecteX_MarksPercentValue: z.preprocess(
                            toNumber,
                            z
                                .number()
                                .min(0.01, { message: 'Enter valid marks/percentage value' })
                                .max(999, { message: 'Marks/Percentage cannot exceed 999' })
                        ),
                        ecteX_RoundOffReqFlg: z.boolean().optional().default(false),
                        ecteX_ConversionReqFlg: z.boolean().optional().default(false),
                        ecteX_NotApplicableToTotal: z.boolean().optional().default(false)
                    })
                )
                .min(1, { message: 'Add at least one exam for the term' })
        })
        // total marks check (sum of saved details must equal ecT_Marks)
        .refine(
            (data) => {
                const total = data.exam_term.reduce((sum, item) => sum + Number(item.ecteX_MarksPercentValue), 0);
                return Number(total) === Number(data.ecT_Marks);
            },
            {
                path: ['saveddetails'],
                message: 'Total Marks / Percentage should be equal to Term Marks'
            }
        )
        // duplicate exam check
        .refine(
            (data) => {
                const examIds = data.exam_term.map((s) => s.emE_Id);
                return new Set(examIds).size === examIds.length;
            },
            {
                path: ['saveddetails'],
                message: 'Duplicate exams not allowed for the same term'
            }
        ),

    delete: z.object({
        ecT_Id: z.number().int().positive({ message: 'Invalid Term ID' }),
        asmaY_Id: z.number().int().positive({ message: 'Invalid Academic Year ID' }),
        emcA_Id: z.number().int().positive({ message: 'Invalid Category ID' })
    })
};

export const ExamSubjectWizardSchema = {
    addOrUpdate: z
        .object({
            AMCO_Id: z.string().min(1, { message: 'Please Select Course' }),
            AMB_Id: z.string().min(1, { message: 'Please Select Branch' }),
            AMSE_Id: z.string().min(1, { message: 'Please Select Semester' }),
            ACSS_Id: z.string().min(1, { message: 'Please Select Subject Scheme' }),
            ACST_Id: z.string().min(1, { message: 'Please Select Scheme Type' }),
            EMG_Id: z.string().min(1, { message: 'Please Select Subject Group' }),

            ECYSE_AttendanceFromDate: z
                .string({
                    required_error: 'Select Date from the Calendar'
                })
                .min(1, { message: 'Select Date from the Calendar' }),

            ECYSE_AttendanceToDate: z
                .string({
                    required_error: 'Select Date from the Calendar'
                })
                .min(1, { message: 'Select Date from the Calendar' }),
            // other properties below
            EMGR_Id: z.string().min(1, { message: 'Select Grade' }),
            ECYSE_SubExamFlg: z.boolean().default(false),
            ECYSE_SubSubjectFlg: z.boolean().default(false),

            exam_list: z
                .array(
                    z.object({
                        emE_Id: z.string(),
                        checked: z.boolean()
                    })
                )
                .refine((list) => list.some((e) => e.checked), {
                    message: 'Select Atleast One Exam'
                }),

            subject_list: z.array(
                z.object({
                    ismS_Id: z.string(),
                    checkedvalue: z.boolean(),
                    ECYSES_MaxMarks: z
                        .string()
                        .regex(/^[0-9]{0,4}\.?[0-9]{1,2}?$/, {
                            message: 'Enter valid format [e.g. 100.00]'
                        })
                        .optional()
                        .or(z.literal('')),
                    ECYSES_MinMarks: z
                        .string()
                        .regex(/^[0-9]{0,4}\.?[0-9]{1,2}?$/, {
                            message: 'Enter valid format [e.g. 100.00]'
                        })
                        .optional()
                        .or(z.literal('')),
                    ECYSES_MarksEntryMax: z
                        .string()
                        .regex(/^[0-9]{0,4}\.?[0-9]{1,2}?$/, {
                            message: 'Enter valid format [e.g. 100.00]'
                        })
                        .optional()
                        .or(z.literal('')),
                    ECYSES_MarksGradeEntryFlg: z.enum(['M', 'G'], {
                        required_error: 'Select Marks/Grade Type'
                    }),
                    ECYSES_MarksDisplayFlg: z.boolean(),
                    ECYSES_GradeDisplayFlg: z.boolean(),
                    ECYSES_AplResultFlg: z.boolean(),
                    EMGR_Id: z.string().min(1, { message: 'Select Grade' })
                })
            )
        })
        // ✅ FIXED refine — applied at object level
        .refine((data) => data.ECYSE_AttendanceToDate >= data.ECYSE_AttendanceFromDate, {
            message: 'Attendance To must be after From Date',
            path: ['ECYSE_AttendanceToDate'] // attach error to correct field
        }),

    delete: z.object({
        ECYSE_Id: z.number({ required_error: 'ECYSE_Id is required' }).positive({ message: 'Invalid ECYSE_Id' })
    })
};

export const SubExamSchema = {
    addOrUpdate: z.object({
        subexam_list: z
            .array(
                z.object({
                    emsE_Id: z.string(),
                    checkedvalue: z.boolean(),
                    ECYSESSS_MaxMarks: z
                        .string()
                        .regex(/^\d{1,4}(\.\d{1,2})?$/, {
                            message: 'Enter valid format [e.g. 100.00]'
                        })
                        .optional()
                        .or(z.literal('')),
                    ECYSESSS_MinMarks: z
                        .string()
                        .regex(/^\d{1,4}(\.\d{1,2})?$/, {
                            message: 'Enter valid format [e.g. 35.00]'
                        })
                        .optional()
                        .or(z.literal('')),
                    EMGR_Id: z.string().optional().or(z.literal('')),
                    ECYSESSS_ExemptedFlg: z.boolean().optional(),
                    ECYSESSS_ExemptedPer: z
                        .string()
                        .regex(/^\d{1,4}(\.\d{1,2})?$/, {
                            message: 'Enter valid percentage [e.g. 10.00]'
                        })
                        .optional()
                        .or(z.literal(''))
                })
            )

            // Ensure at least one sub-exam is selected
            .refine((list) => list.some((s) => s.checkedvalue), {
                message: 'Select at least one Sub-Exam'
            })

            // Ensure marks and grade are provided when a sub-exam is selected
            .refine((list) => list.every((s) => !s.checkedvalue || (!!s.ECYSESSS_MaxMarks && !!s.ECYSESSS_MinMarks && !!s.EMGR_Id)), {
                message: 'Please fill Max Marks, Min Marks, and Grade for all selected sub-exams'
            })

            // Ensure numeric consistency (Min ≤ Max)
            .refine((list) => list.every((s) => !s.checkedvalue || Number(s.ECYSESSS_MinMarks || 0) <= Number(s.ECYSESSS_MaxMarks || 0)), {
                message: 'Min Marks cannot be greater than Max Marks'
            })
    }),

    delete: z.object({
        ECYSESSS_Id: z
            .number({
                required_error: 'ECYSESSS_Id is required'
            })
            .positive({
                message: 'Invalid ECYSESSS_Id'
            })
    })
};

export const SubSubjectSchema = {
    addOrUpdate: z.object({
        subsubject_list: z
            .array(
                z.object({
                    emsS_Id: z.string(),
                    checkedvalue: z.boolean(),
                    ECYSESSS_MaxMarks: z
                        .string()
                        .regex(/^[0-9]{0,4}\.?[0-9]{1,2}?$/, {
                            message: 'Enter valid format [e.g. 100.00]'
                        })
                        .optional()
                        .or(z.literal('')),
                    ECYSESSS_MinMarks: z
                        .string()
                        .regex(/^[0-9]{0,4}\.?[0-9]{1,2}?$/, {
                            message: 'Enter valid format [e.g. 100.00]'
                        })
                        .optional()
                        .or(z.literal('')),
                    EMGR_Id: z.string().min(1, { message: 'Select Grade' }),
                    ECYSESSS_ExemptedFlg: z.boolean(),
                    ECYSESSS_ExemptedPer: z
                        .string()
                        .regex(/^[0-9]{0,4}\.?[0-9]{1,2}?$/, {
                            message: 'Enter valid format [e.g. 100.00]'
                        })
                        .optional()
                        .or(z.literal(''))
                })
            )
            .refine((list) => list.some((s) => s.checkedvalue), {
                message: 'Select at least one Sub-Subject'
            })
            .refine((list) => list.every((s) => !s.checkedvalue || (!!s.ECYSESSS_MaxMarks && !!s.ECYSESSS_MinMarks && !!s.EMGR_Id)), {
                message: 'Enter marks and grade for selected sub-subjects'
            })
    }),

    delete: z.object({
        ECYSESSS_Id: z.number({ required_error: 'ECYSESSS_Id is required' }).positive({ message: 'Invalid ECYSESSS_Id' })
    })
};
