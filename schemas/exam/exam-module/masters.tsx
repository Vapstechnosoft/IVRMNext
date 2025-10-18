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
        ismS_Min_Marks: z
            .number({ invalid_type_error: 'Min Marks is required' })
            .min(1, { message: 'Min Marks should be greater than 0' })
            .max(100, { message: 'Min Marks should be less than or equal to 100' })
            .optional()
            .nullable(),
        ismS_Max_Marks: z
            .number({ invalid_type_error: 'Max Marks is required' })
            .min(1, { message: 'Max Marks should be greater than 0' })
            .max(100, { message: 'Max Marks should be less than or equal to 100' })
            .optional()
            .nullable(),
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
        empatY_Id: z.number().optional(),
        mI_Id: z.number().optional(),
        user_id: z.number().optional(),
        empatY_PaperTypeName: createStringSchema('Paper Type Name', 1, 100),
        empatY_Color: createStringSchema('Color', 1, 50),
        empatY_PaperTypeDescription: createStringSchema('Paper Type Description', 1, 200)
    }),

    delete: z.object({
        empatY_Id: deleteIdSchema('empatY_Id')
    })
};

export const masterSubExamSchema = {
    addOrUpdate: z.object({
        emsE_Id: z.number().int({ message: 'Sub Exam Id is required' }).optional(),
        mI_Id: z.number().int({ message: 'Institute ID is required' }),
        emsE_SubExamName: createStringSchema('Sub Exam Name', 1, 100),
        emsE_SubExamCode: createStringSchema('Sub Exam Code', 1, 50)
    }),

    delete: z.object({
        emsE_Id: deleteIdSchema('emsE_Id')
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
    emgD_Id: z.number().default(0),
    emgR_Id: z.number().default(0),
    emgD_Name: z.string().nonempty({ message: 'Grade Name is required' }),
    emgD_From: z.preprocess((val) => (val === '' || val === undefined ? 0 : Number(val)), z.number().min(0).max(100)),
    emgD_To: z.preprocess((val) => (val === '' || val === undefined ? 0 : Number(val)), z.number().min(0).max(100)),
    emgD_GradePoints: z.preprocess((val) => (val === '' || val === undefined ? 0 : Number(val)), z.number().min(0).max(100)),
    emgD_Remarks: z.string().optional(),
    emgD_ActiveFlag: z.boolean().default(true)
});

// Master Grade Schema
export const masterGradeSchema = {
    addOrUpdate: z.object({
        emgR_Id: z.number().optional(),
        mI_Id: z.number().optional(),
        emgR_GradeName: z
            .string()
            .nonempty({ message: 'Grade Name is required' })
            .max(100, { message: 'Grade Name cannot exceed 100 characters' }),
        emgR_MarksPerFlag: z.enum(['m', 'p'], { required_error: 'Marks/Percentage flag is required' }),
        emgR_ActiveFlag: z.boolean().default(true),
        grade_list: z.array(gradeDetailsSchema).min(1, { message: 'At least one grade detail is required' })
    }),

    delete: z.object({
        emgR_Id: z.number({ required_error: 'Grade Id is required' })
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
        emcA_Id: z.number().optional(), // For update case
        mI_Id: z.number().optional(), // Optional, defaults can be set in form if needed

        emcA_CategoryName: z.string().trim().min(1, 'Category Name is required').max(100, 'Category Name should not exceed 100 characters'),

        emcA_CCECheckingFlg: z.boolean({
            required_error: 'CCE Checking Flag is required'
        }),

        emcA_ActiveFlag: z
            .boolean({
                required_error: 'Active Flag is required'
            })
            .optional()
    }),

    delete: z.object({
        emcA_Id: z.number({ required_error: 'Category Id is required' })
    })
};

export const categoryClassMappingSchema = {
    addOrUpdate: z.object({
        emcA_Id: z.number().optional().default(0),
        mI_Id: z.number().min(1, { message: 'MI Id is required' }),
        emcA_CategoryName: z.string().min(1, { message: 'Category Name is required' }),
        emcA_CCECheckingFlg: z.boolean().default(true),
        emcA_ActiveFlag: z.boolean().default(true),
        ecaC_Id: z.number().optional().default(0),
        asmaY_Id: z.number().min(1, { message: 'Academic Year is required' }),
        asmcL_Id: z.number().min(1, { message: 'Class is required' }),
        asmS_Id: z.number().optional().default(0),
        ecaC_ActiveFlag: z.boolean().default(true),
        asmaY_Year: z.string().min(1, { message: 'Academic Year is required' }),
        asmcL_ClassName: z.string().min(1, { message: 'Class Name is required' }),
        asmC_SectionName: z.string().optional(),
        asmaY_Order: z.number().optional().default(0),

        section_list: z
            .array(
                z.object({
                    createdDate: z.string().optional(),
                    updatedDate: z.string().optional(),
                    mI_Id: z.number(),
                    asmS_Id: z.number().min(1, { message: 'Section Id is required' }),
                    asmC_SectionCode: z.string().min(1, { message: 'Section Code is required' }),
                    asmC_SectionName: z.string().min(1, { message: 'Section Name is required' }),
                    asmC_MaxCapacity: z.number().nonnegative(),
                    asmC_Order: z.number().nonnegative(),
                    asmC_ActiveFlag: z.number().min(0).max(1)
                })
            )
            .min(1, { message: 'At least one section must be provided' })
    })
};
