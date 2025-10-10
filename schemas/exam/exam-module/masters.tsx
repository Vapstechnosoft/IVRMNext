import { z } from 'zod';
import { createStringSchema, deleteIdSchema } from '../../validationSchemas';

export const loginSchema = z.object({
    email: z.string({ message: 'Email is required' }),
    password: createStringSchema('Password', 6, 50)
});

export const masterSubjectSchema = {
    addOrUpdate: z.object({
        exsuB_Id: z.number().int({ message: 'Subject Id is required' }).optional(),
        exsuB_SubjectName: createStringSchema('Subject Name', 1, 100),
        exsuB_IVRSName: createStringSchema('IVRS Subject Name', 1, 100),
        exsuB_SubjectCode: createStringSchema('Subject Code', 1, 50),
        exsuB_SubjectType: createStringSchema('Subject Type', 1, 50),

        exsuB_MaxMarks: z.number().int({ message: 'Maximum Marks are required' }),
        exsuB_MinMarks: z.number().int({ message: 'Minimum Marks are required' }),

        exsuB_PreAdmissionFlag: z.number().int({ message: 'Pre-Admission Flag is required' }),
        exsuB_AttendanceFlag: z.number().int({ message: 'Attendance Flag is required' }),
        exsuB_BatchWiseFlag: z.number().int({ message: 'Batch Wise Flag is required' }),
        exsuB_ExamFlag: z.number().int({ message: 'Exam Flag is required' }),
        exsuB_LanguageFlag: z.number().int({ message: 'Language Flag is required' }),
        exsuB_ExtraFeeFlag: z.number().int({ message: 'Extra Fee Flag is required' }),
        exsuB_IsActiveFlag: z.number().int({ message: 'Active Flag is required' })
    }),

    delete: z.object({
        exsuB_Id: deleteIdSchema('exsuB_Id')
    })
};

export const masterExamSchema = {
    addOrUpdate: z.object({
        ex_Id: z.number().int({ message: 'Exam Id is required' }).optional(),

        ex_ExamName: createStringSchema('Exam Name', 1, 100),
        ex_IVRSExamName: createStringSchema('IVRS Exam Name', 1, 100),
        ex_ExamDescription: createStringSchema('Exam Description', 1, 200),
        ex_ExamCode: createStringSchema('Exam Code', 1, 50),

        ex_ExamOrder: z.number().int({ message: 'Exam Order is required' }),
        ex_FinalExamFlag: z.number().int({ message: 'Final Exam Flag is required' }),
        ex_SubjectWiseMarksPublishFlag: z.number().int({ message: 'Subject Wise Marks Publish Flag is required' }),

        ex_IsActiveFlag: z.boolean({ message: 'Active Flag is required' })
    }),

    delete: z.object({
        ex_Id: deleteIdSchema('ex_Id')
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
        ex_Id: z.number().int({ message: 'Sub Subject Id is required' }).optional(),

        ex_SubSubjectName: createStringSchema('Sub Subject Name', 1, 100),
        ex_SubSubjectCode: createStringSchema('Sub Subject Code', 1, 50),
        ex_SubSubjectOrder: z.number().int({ message: 'Sub Subject Order is required' }),

        ex_IsActiveFlag: z.boolean({ message: 'Active Flag is required' })
    }),

    delete: z.object({
        ex_Id: deleteIdSchema('ex_Id')
    })
};

// Schema for individual grade details
export const gradeDetailsSchema = z.object({
    ex_Id: deleteIdSchema('ex_Id').optional(),

    // From - must be number between 0 and 100
    ex_From: z
        .string()
        .nonempty({ message: 'From is required' })
        .refine((val) => /^[0-9]+$/.test(val), { message: 'From must be a number' })
        .refine((val) => Number(val) >= 0 && Number(val) <= 100, {
            message: 'From must be between 0 and 100'
        }),

    // To - must be number between 0 and 100
    ex_To: z
        .string()
        .nonempty({ message: 'To is required' })
        .refine((val) => /^[0-9]+$/.test(val), { message: 'To must be a number' })
        .refine((val) => Number(val) >= 0 && Number(val) <= 100, {
            message: 'To must be between 0 and 100'
        }),

    // Grade - short code like A, B+, etc.
    ex_Grade: z
        .string()
        .nonempty({ message: 'Grade is required' })
        .min(1, { message: 'Grade must be at least 1 character' })
        .max(5, { message: 'Grade cannot exceed 5 characters' }),

    // Grade Points - numeric string allowed
    ex_GradePoints: z
        .string()
        .nonempty({ message: 'Grade Points is required' })
        .refine((val) => /^[0-9]+$/.test(val), {
            message: 'Grade Points must be a number'
        })
        .refine((val) => Number(val) >= 0 && Number(val) <= 100, {
            message: 'Grade Points must be between 0 and 100'
        }),

    // Remarks - optional
    ex_Remarks: z.string().max(100, { message: 'Remarks cannot exceed 100 characters' }).optional()
});

// Master grade schema
export const masterGradeSchema = z.object({
    ex_GradeName: z
        .string()
        .nonempty({ message: 'Grade Name is required' })
        .min(1, { message: 'Grade Name must be at least 1 character' })
        .max(100, { message: 'Grade Name cannot exceed 100 characters' }),

    ex_GradeDetails: z.enum(['percentage', 'marks'], {
        required_error: 'Type is required'
    }),

    gradeDetails: z.array(gradeDetailsSchema).min(1, { message: 'At least one grade detail is required' })
});

// Individual subject schema based on IMasterSubjectGroupDetails
export const subjectGroupDetailSchema = z.object({
    ex_Id: z.number(), // subject ID
    ex_SubjectName: z
        .string()
        .nonempty({ message: 'Subject Name is required' })
        .max(100, { message: 'Subject Name cannot exceed 100 characters' }),
    ex_SubjectCode: z
        .string()
        .nonempty({ message: 'Subject Code is required' })
        .max(20, { message: 'Subject Code cannot exceed 20 characters' }),
    selected: z.boolean().optional()
});

// Master subject group schema based on IMasterSubjectGroup
export const masterSubjectGroupSchema = z.object({
    ex_GroupName: z
        .string()
        .nonempty({ message: 'Group Name is required' })
        .max(100, { message: 'Group Name cannot exceed 100 characters' }),
    ex_MaxApplicapleSubjects: z.number({ required_error: 'Max Applicable Subjects is required' }).min(1, { message: 'Must be at least 1' }),
    ex_MinApplicableSubjects: z.number({ required_error: 'Min Applicable Subjects is required' }).min(1, { message: 'Must be at least 1' }),
    ex_BestOffSubjects: z.number({ required_error: 'Best Off Subjects is required' }).min(0, { message: 'Must be 0 or more' }),
    subjects: z.array(subjectGroupDetailSchema).min(1, { message: 'At least one subject must be selected' })
});

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
