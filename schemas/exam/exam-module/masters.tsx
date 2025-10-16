import { z } from 'zod';
import { createStringSchema, deleteIdSchema } from '../../validationSchemas';

export const loginSchema = z.object({
    email: z.string({ message: 'Email is required' }),
    password: createStringSchema('Password', 6, 50)
});

export const masterSubjectSchema = {
    addOrUpdate: z.object({
        ismS_Id: z.number().int({ message: 'Subject Id is required' }).optional(),
        mI_Id: z.number().int({ message: 'MI ID is required' }).optional(),
        ismS_SubjectName: createStringSchema('Subject Name', 1, 100),
        ismS_IVRSSubjectName: createStringSchema('IVRS Subject Name', 1, 100),
        ismS_SubjectCode: createStringSchema('Subject Code', 1, 50),
        ismS_SubjectNameNew: createStringSchema('Subject Type / New Name', 1, 50),
        ismS_Max_Marks: z.number().int({ message: 'Maximum Marks are required' }),
        ismS_Min_Marks: z.number().int({ message: 'Minimum Marks are required' }),
        ismS_PreadmFlag: z.number().int({ message: 'Pre-Admission Flag is required' }),
        ismS_AttendanceFlag: z.boolean({ required_error: 'Attendance Flag is required' }),
        ismS_BatchAppl: z.number().int({ message: 'Batch Applicable Flag is required' }),
        ismS_ExamFlag: z.number().int({ message: 'Exam Flag is required' }),
        ismS_LanguageFlg: z.number().int({ message: 'Language Flag is required' }),
        ismS_AtExtraFeeFlg: z.number().int({ message: 'Extra Fee Flag is required' }),
        ismS_ActiveFlag: z.number().int({ message: 'Active Flag is required' }) // <--- THIS WAS MISSING IN DEFAULT VALUES
    }),
    delete: z.object({
        ismS_Id: deleteIdSchema('ismS_Id')
    })
};

export const masterExamSchema = {
    addOrUpdate: z.object({
        emE_Id: z.number().optional(),
        mI_Id: z.number(),
        emE_ExamName: z.string().min(1, { message: 'Exam Name is required' }),
        emE_ExamCode: z.string().min(1, { message: 'Exam Code is required' }),
        emE_ExamDescription: z.string().min(1, { message: 'Exam Description is required' }),
        emE_IVRSExamName: z.string().min(1, { message: 'IVRS Exam Name is required' }),
        emE_FinalExamFlag: z.boolean({
            required_error: 'Final Exam flag is required'
        }),
        emE_SujectwiseMarksPublishFlg: z.boolean({
            required_error: 'Subject wise marks publish flag is required'
        })
    }),
    delete: z.object({
        emE_Id: deleteIdSchema('emE_Id')
    })
};

export const masterExamPaperSchema = {
    addOrUpdate: z.object({
        ex_Id: z.number().int({ message: 'Exam Paper Id is required' }).optional(),

        ex_ExamPaperType: createStringSchema('Exam Paper Type', 1, 100),
        ex_DisplayColor: createStringSchema('Display Color', 1, 50),
        ex_PaperTypeDescription: createStringSchema('Paper Type Description', 1, 200),

        ex_IsActiveFlag: z.boolean({ message: 'Active Flag is required' })
    }),

    delete: z.object({
        ex_Id: deleteIdSchema('ex_Id')
    })
};

export const masterSubExamSchema = {
    addOrUpdate: z.object({
        ex_Id: z.number().int({ message: 'Sub Exam Id is required' }).optional(),

        ex_SubExamName: createStringSchema('Sub Exam Name', 1, 100),
        ex_SubExamCode: createStringSchema('Sub Exam Code', 1, 50),

        ex_IsActiveFlag: z.boolean({ message: 'Active Flag is required' })
    }),

    delete: z.object({
        ex_Id: deleteIdSchema('ex_Id')
    })
};

export const masterSubSubjectSchema = {
    addOrUpdate: z.object({
        emsS_Id: z.number().int().optional(), // optional for new entries
        mI_Id: z.number().int({ message: 'Master ID is required' }), // required master ID
        emsS_SubSubjectName: createStringSchema('Sub Subject Name', 1, 100),
        emsS_SubSubjectCode: createStringSchema('Sub Subject Code', 1, 50),
        emsS_Order: z.number().int().optional(), // backend can handle default
        emsS_ActiveFlag: z.boolean().optional() // not edited, will pass existing value
    }),

    // Delete Sub Subject
    delete: z.object({
        emsS_Id: deleteIdSchema('emsS_Id')
    })
};

const gradeDetailsSchema = z.object({
    emgR_Id: z.union([z.string(), z.number()]).optional(),
    emgD_Name: z.string().nonempty({ message: 'Grade Name is required' }),
    emgD_From: z.preprocess(
        (val) => (val === '' || val === undefined ? 0 : Number(val)),
        z.number().min(0, { message: 'From must be >= 0' }).max(100, { message: 'From must be <= 100' })
    ),
    emgD_To: z.preprocess(
        (val) => (val === '' || val === undefined ? 0 : Number(val)),
        z.number().min(0, { message: 'To must be >= 0' }).max(100, { message: 'To must be <= 100' })
    ),
    emgD_GradePoints: z.preprocess(
        (val) => (val === '' || val === undefined ? 0 : Number(val)),
        z.number().min(0, { message: 'Grade Points must be >= 0' }).max(100, { message: 'Grade Points must be <= 100' })
    ),
    emgD_Remarks: z.string().optional()
});

// Master Grade Schema
export const masterGradeSchema = {
    addOrUpdate: z.object({
        emgR_Id: z.number().int({ message: 'Grade Id is required' }).optional(),
        mI_Id: z.number().int({ message: 'Institute ID is required' }),
        emgR_GradeName: createStringSchema('Grade Name', 1, 100),
        emgR_MarksPerFlag: z.enum(['m', 'p'], {
            required_error: 'Marks/Percentage flag is required'
        }),
        emgR_ActiveFlag: z.boolean({ required_error: 'Active flag is required' }),
        subject_list: z.array(gradeDetailsSchema).min(1, { message: 'At least one grade detail is required' })
    }),

    delete: z.object({
        emgR_Id: deleteIdSchema('emgR_Id')
    })
};

// Individual subject schema based on IMasterSubjectGroupDetails
export const subjectGroupDetailSchema = z.object({
    ismS_Id: z.number().optional(),
    ismS_SubjectName: z.string().max(100, { message: 'Subject Name cannot exceed 100 characters' }).optional(), // ✅ now optional
    ismS_SubjectCode: z.string().max(20, { message: 'Subject Code cannot exceed 20 characters' }).optional(), // ✅ now optional
    selected: z.boolean().optional()
});

// ✅ Master subject group schema
export const masterSubjectGroupSchema = {
    addOrUpdate: z.object({
        emG_Id: z.number().optional(),
        mI_Id: z.number().optional(),
        emG_GroupName: z
            .string()
            .nonempty({ message: 'Group Name is required' })
            .max(100, { message: 'Group Name cannot exceed 100 characters' }),

        emG_TotSubjects: z
            .number({ required_error: 'Total Subjects is required' })
            .min(1, { message: 'Total Subjects must be at least 1' }),

        emG_MaxAplSubjects: z
            .number({ required_error: 'Max Applicable Subjects is required' })
            .min(1, { message: 'Max Applicable Subjects must be at least 1' }),

        emG_MinAplSubjects: z
            .number({ required_error: 'Min Applicable Subjects is required' })
            .min(1, { message: 'Min Applicable Subjects must be at least 1' }),

        emG_BestOff: z
            .number({ required_error: 'Best Off Subjects is required' })
            .min(0, { message: 'Best Off Subjects must be 0 or greater' }),

        subject_list: z.array(subjectGroupDetailSchema).optional()
        //   .array(subjectGroupDetailSchema)
        //   .min(1, { message: 'At least one subject must be selected' }),
    }),

    delete: z.object({
        emG_Id: z.number({ required_error: 'emG_Id is required' })
    })
};

export const masterCategorySchema = {
    addOrUpdate: z.object({
        ex_Id: z.number().optional(), // For update case

        ex_CategoryName: z.string().trim().min(1, 'Category Name is required').max(100, 'Category Name should not exceed 100 characters'),

        ex_CCEPromotionApplicableFlag: z
            .number({
                required_error: 'CCE Promotion Applicable Flag is required',
                invalid_type_error: 'CCE Promotion Applicable Flag must be a number (0 or 1)'
            })
            .int()
            .refine((val) => val === 0 || val === 1, {
                message: 'CCE Promotion Applicable Flag must be either 0 or 1'
            }),

        ex_IsActiveFlag: z
            .number({
                required_error: 'Active Flag is required',
                invalid_type_error: 'Active Flag must be a number (0 or 1)'
            })
            .int()
            .refine((val) => val === 0 || val === 1, {
                message: 'Active Flag must be either 0 or 1'
            })
    }),

    delete: z.object({
        ex_Id: z
            .number({
                required_error: 'Category Id is required'
            })
            .int()
            .positive()
    })
};
