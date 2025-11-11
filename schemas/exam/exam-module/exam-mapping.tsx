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
            eyc_Id: z.preprocess(toNumber, z.number().int().positive({ message: 'Select Category' }).optional()),
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

const isoDateString = z.string().refine(
    (s) => {
        // allow empty? no — require proper ISO-like string
        const d = new Date(s);
        return !Number.isNaN(d.getTime());
    },
    { message: 'Invalid date format (expected ISO date string)' }
);

const ExamItemSchema = z.object({
    EME_Id: z.number().int().nonnegative(), // exam id
    EME_ExamName: z.string().optional(),
    EME_ExamCode: z.string().optional(),
    EME_ExamOrder: z.number().int().nonnegative().optional(),
    EME_FinalExamFlag: z.boolean().optional(),
    EME_ActiveFlag: z.boolean().optional()
});

const YearlyCategoryExamSubjectSchema = z.object({
    EYCES_Id: z.number().int().nonnegative().optional(),
    EYCE_Id: z.number().int().nonnegative().optional(),
    ISMS_Id: z.number().int().positive({ message: 'ISMS_Id required' }),
    EMGR_Id: z.number().int().positive({ message: 'EMGR_Id required' }),
    EYCES_MaxMarks: z.number().min(0).optional(),
    EYCES_MinMarks: z.number().min(0).optional(),
    EYCES_MarksEntryMax: z.number().min(0).optional(),
    EYCES_SubExamFlg: z.boolean().optional(),
    EYCES_SubSubjectFlg: z.boolean().optional(),
    EYCES_ActiveFlg: z.boolean().optional(),
    EYCES_SubjectOrder: z.number().int().nonnegative().optional(),
    Exam_Subject_PT_GradeList: z.array(z.any()).optional()
});

export const SubSubjectSubExamSchema = z
    .object({
        eycessS_Id: z.number().int().nonnegative().optional(), // Primary key
        eyceS_Id: z.number().int().nonnegative().optional(), // Foreign key to parent subject
        ismS_Id: z.number().int().positive({ message: 'ismS_Id required' }), // Subject Id
        emsS_Id: z.number().int().positive({ message: 'emsS_Id required' }), // SubSubject Id
        emgR_GradeName: z.string().min(1, { message: 'Grade Name required' }),
        ismS_SubjectName: z.string().min(1, { message: 'Subject Name required' }),
        ismS_SubjectCode: z.string().min(1, { message: 'Subject Code required' }),
        emsS_SubSubjectName: z.string().min(1, { message: 'SubSubject Name required' }),
        emsS_SubSubjectCode: z.string().min(1, { message: 'SubSubject Code required' }),

        eycessS_MaxMarks: z.number({ invalid_type_error: 'Enter Max Marks' }).min(0, 'Max Marks must be 0 or greater'),
        eycessS_MinMarks: z.number({ invalid_type_error: 'Enter Min Marks' }).min(0, 'Min Marks must be 0 or greater'),
        eycessS_ExemptedFlg: z.boolean().optional().default(false),
        eycessS_ExemptedPer: z.number().min(0).max(100).optional(),
        eycessS_SubSubjectOrder: z.number().int().nonnegative().optional(),
        eycessS_ActiveFlg: z.boolean().optional().default(true),
        eycessS_GradesFlg: z.boolean().optional().default(false),
        eycessS_MarksFlg: z.boolean().optional().default(false)
    })
    //Logical validation refinements
    .refine((data) => data.eycessS_MinMarks < data.eycessS_MaxMarks, {
        message: 'Min Marks should be less than Max Marks',
        path: ['eycessS_MinMarks']
    })
    .refine((data) => !data.eycessS_ExemptedFlg || (data.eycessS_ExemptedPer !== undefined && data.eycessS_ExemptedPer > 0), {
        message: 'Exempted Percentage required when Exempted Flag is true',
        path: ['eycessS_ExemptedPer']
    });

const ExmSubjectSubsubjectsSubexamWrapperSchema = z.object({
    ISMS_Id: z.number().int().positive({ message: 'ISMS_Id required' }),
    sub_subject_sub_exam_list: z.array(SubSubjectSubExamSchema).optional()
});

/**
 * MAIN updated schema to match your payload plus validations
 */
export const ExamSubjectWizardSchema = {
    addOrUpdate: z
        .object({
            // top level ids & flags (matching payload keys)
            EYCE_Id: z.number().int().nonnegative().optional().default(0),
            EYC_Id: z.number().int().positive({ message: 'EYC_Id required' }),
            EMCA_Id: z.number().int().positive({ message: 'EMCA_Id required' }),
            EMGR_Id: z.number().int().positive({ message: 'EMGR_Id required' }),

            // flags
            EYCE_SubExamFlg: z.boolean().optional(),
            EYCE_SubSubjectFlg: z.boolean().optional(),
            EYCE_ActiveFlg: z.boolean().optional(),

            // attendance dates (validate iso and not empty)
            EYCE_AttendanceFromDate: isoDateString,
            EYCE_AttendanceToDate: isoDateString,

            UserId: z.number().int().nonnegative().optional().default(0),
            MI_Id: z.number().int().nonnegative().optional().default(0),
            ASMAY_Id: z.number().int().nonnegative().optional().default(0),
            ASMAY_Year: z.string().optional().nullable(),

            // BestOf fields
            EYCE_BestOfApplicableFlg: z.boolean().optional(),
            EYCE_BestOf: z.number().int().min(0).optional(),
            exams_list: z.array(ExamItemSchema).optional().default([]),
            yearly_category_exam_subjects: z
                .array(YearlyCategoryExamSubjectSchema)
                .min(1, { message: 'At least one yearly_category_exam_subjects is required' }),

            // lists that may be empty arrays in payload; validating shapes loosely
            exm_subject_subexams_list: z.array(z.any()).optional(),
            exm_subject_subsubjects_list: z.array(z.any()).optional(),

            // nested structure for subsubjects->subexam
            exm_subject_subsubjects_subexam: z.array(ExmSubjectSubsubjectsSubexamWrapperSchema).optional(),

            Temp_Subject_Order: z.array(z.any()).optional().default([])
        })
        // Attendance date ordering
        .refine(
            (data) => {
                try {
                    const from = new Date(data.EYCE_AttendanceFromDate).getTime();
                    const to = new Date(data.EYCE_AttendanceToDate).getTime();
                    return !Number.isNaN(from) && !Number.isNaN(to) && to >= from;
                } catch {
                    return false;
                }
            },
            { message: 'Attendance To must be after From Date', path: ['EYCE_AttendanceToDate'] }
        ),

    // keep delete schema similar to your prior example (rename to match EYCE if needed)
    delete: z.object({
        EYCE_Id: z.number({ required_error: 'EYCE_Id is required' }).int().positive({ message: 'Invalid EYCE_Id' })
    })
};

export const BaseExamSubjectSchema = {
    addOrUpdate: z
        .object({
            // Primary Identifiers
            EYCE_Id: z.number().int().nonnegative().optional().default(0),
            EYC_Id: z.number().int().positive({ message: 'EYC_Id is required' }),
            ISMS_Id: z.number().int().positive({ message: 'ISMS_Id is required' }),
            EMCA_Id: z.number().int().positive({ message: 'EMCA_Id is required' }),
            EMGR_Id: z.number().int().positive({ message: 'EMGR_Id is required' }),

            // Subject Info
            ISMS_SubjectName: z.string().min(1, { message: 'Subject name is required' }),
            ISMS_SubjectCode: z.string().min(1, { message: 'Subject code is required' }),

            // Marks & Grade Info
            EYCES_MaxMarks: z.number().min(0, { message: 'Max marks must be 0 or greater' }).max(1000, { message: 'Max marks too large' }),
            EYCES_MinMarks: z.number().min(0, { message: 'Min marks must be 0 or greater' }).max(1000, { message: 'Min marks too large' }),
            EYCES_MarksEntryMax: z
                .number()
                .min(0, { message: 'Marks entry max must be 0 or greater' })
                .max(1000, { message: 'Marks entry max too large' }),

            // Flags
            EYCES_SubExamFlg: z.boolean().optional().default(false),
            EYCES_SubSubjectFlg: z.boolean().optional().default(false),
            EYCES_MarksGradeEntryFlg: z.enum(['M', 'G'], { message: 'Invalid marks/grade entry flag' }),
            EYCES_MarksDisplayFlg: z.boolean().optional().default(true),
            EYCES_GradeDisplayFlg: z.boolean().optional().default(true),
            EYCES_AplResultFlg: z.boolean().optional().default(true),
            EYCES_ActiveFlg: z.boolean().optional().default(true),

            // Order
            EYCES_SubjectOrder: z.number().int().min(1, { message: 'Subject order must be at least 1' }),

            // Optional info
            PT_Count: z.number().int().nonnegative().optional().default(0),

            // Meta info
            UserId: z.number().int().nonnegative().optional().default(0),
            MI_Id: z.number().int().nonnegative().optional().default(0),
            ASMAY_Id: z.number().int().nonnegative().optional().default(0),
            ASMAY_Year: z.string().optional().nullable()
        })
        //  Cross-field validations
        .refine((data) => data.EYC_Id > 0 && data.ISMS_Id > 0 && data.EMCA_Id > 0, {
            message: 'Required identifiers are missing',
            path: ['EYC_Id']
        })
        .refine((data) => data.EYC_Id > 0, { message: 'EYC_Id must be positive', path: ['EYC_Id'] })
        .refine((data) => data.EYCES_MinMarks <= data.EYCES_MaxMarks, {
            message: 'Min marks must be less than or equal to Max marks',
            path: ['EYCES_MinMarks']
        })
        .refine((data) => data.EYCES_MarksEntryMax <= data.EYCES_MaxMarks, {
            message: 'Marks entry max cannot exceed Max marks',
            path: ['EYCES_MarksEntryMax']
        }),

    //  Delete schema block
    delete: z.object({
        EYCE_Id: z.number({ required_error: 'EYCE_Id is required' }).int().positive({ message: 'Invalid EYCE_Id' })
    })
};
export const CoScholasticActivityAreaMappingSchema = {
    addOrUpdate: z
        .object({
            mI_Id: z.number().int().nonnegative().optional(),
            ecactAAM_Id: z.number().int().nonnegative().optional(),
            ecactaM_Id: z.number().int().nonnegative().optional(),

            // 🔹 Academic Year
            asmaY_Id: z.number().int().positive({ message: 'Select Academic Year' }),

            // 🔹 Activities Name
            ecacT_Id: z.number().int().positive({ message: 'Select Activities Name' }),

            // 🔹 Activities Area Name
            ecactA_Id: z.number().int().positive({ message: 'Select Activities Area Name' }),

            // 🔹 Master Grade
            emgR_Id: z.number().int().positive({ message: 'Select Master Grade' }),

            // 🔹 Indicators Description (optional but with max length validation)
            ecactaM_IndicatorDescription: z
                .string()
                .trim()
                .max(500, { message: 'Indicator Description cannot exceed 500 characters' })
                .optional()
                .nullable(),

            // 🔹 Active Flag
            ecactaM_ActiveFlag: z.boolean({ required_error: 'Active flag is required' })
        })
        .strict(),

    delete: z.object({
        ecactaM_Id: z.number().int().positive({ message: 'Invalid Mapping ID' }),
        asmaY_Id: z.number().int().positive({ message: 'Invalid Academic Year ID' }),
        ecactA_Id: z.number().int().positive({ message: 'Invalid Activity ID' })
    })
};
