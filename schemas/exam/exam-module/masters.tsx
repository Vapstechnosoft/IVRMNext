import { z } from 'zod';
import { createCustomStringSchema, createStringSchema, deleteIdSchema } from '../../validationSchemas';

export const loginSchema = z.object({
    email: z.string({ message: 'Email is required' }),
    password: createStringSchema('Password', 6, 50)
});

export const masterSubjectSchema = {
    addOrUpdate: z
        .object({
            ismS_Id: z.number().int({ message: 'Subject Id is required' }).optional(),
            mI_Id: z.number().int({ message: 'MI ID is required' }).optional(),
            ismS_IVRSSubjectName: createCustomStringSchema('IVRS Subject Name', 1, 100),
            ismS_SubjectCode: createStringSchema('Subject Code', 1, 50),
            ismS_SubjectNameNew: createStringSchema('Subject Type / New Name', 1, 50),
            ismS_SubjectName: createStringSchema('Subject Name', 1, 50),
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
            ismS_ActiveFlag: z.number().int({ message: 'Active Flag is required' })
        })
        .refine(
            (data) => {
                if (data.ismS_Min_Marks != null && data.ismS_Max_Marks != null) {
                    return data.ismS_Max_Marks > data.ismS_Min_Marks;
                }
                return true; // skip check if either is null
            },
            {
                message: 'Max Marks must be greater than Min Marks',
                path: ['ismS_Max_Marks'] // show error near max marks field
            }
        )
        .refine(
            (data) => {
                if (data.ismS_Min_Marks != null && data.ismS_Max_Marks != null) {
                    return data.ismS_Min_Marks < data.ismS_Max_Marks;
                }
                return true;
            },
            {
                message: 'Min Marks must be less than Max Marks',
                path: ['ismS_Min_Marks']
            }
        ),

    delete: z.object({
        ismS_Id: deleteIdSchema('ismS_Id')
    })
};

export const masterExamSchema = {
    addOrUpdate: z.object({
        emE_Id: z.number().optional(),
        mI_Id: z.number(),
        emE_ExamName: createCustomStringSchema('Exam Name', 1, 100),
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
        empatY_PaperTypeName: createCustomStringSchema('Paper Type Name', 1, 100),
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
        emsE_SubExamName: createCustomStringSchema('Sub Exam Name', 1, 100),
        emsE_SubExamCode: createCustomStringSchema('Sub Exam Code', 1, 50)
    }),

    delete: z.object({
        emsE_Id: deleteIdSchema('emsE_Id')
    })
};
export const masterSubSubjectSchema = {
    addOrUpdate: z.object({
        emsS_Id: z.number().int().optional(), // optional for new entries
        mI_Id: z.number().int({ message: 'Master ID is required' }), // required master ID
        emsS_SubSubjectName: createCustomStringSchema('Sub Subject Name', 1, 100),
        emsS_SubSubjectCode: createCustomStringSchema('Sub Subject Code', 1, 50),
        emsS_Order: z.number().int().optional(), // backend can handle default
        emsS_ActiveFlag: z.boolean().optional() // not edited, will pass existing value
    }),

    // Delete Sub Subject
    delete: z.object({
        emsS_Id: deleteIdSchema('emsS_Id')
    })
};

export const gradeDetailsSchema = z
    .object({
        emgD_Id: z.number().default(0),
        emgR_Id: z.number().default(0),
        emgD_Name: createCustomStringSchema('Grade Name', 1, 100),
        emgD_From: z.preprocess(
            (val) => (val === '' || val === undefined ? 0 : Number(val)),
            z.number().min(0, { message: 'From must be at least 0' }).max(100, { message: 'From cannot exceed 100' })
        ),
        emgD_To: z.preprocess(
            (val) => (val === '' || val === undefined ? 0 : Number(val)),
            z.number().min(0, { message: 'To must be at least 0' }).max(100, { message: 'To cannot exceed 100' })
        ),
        emgD_GradePoints: z.preprocess((val) => (val === '' || val === undefined ? 0 : Number(val)), z.number().min(0).max(10)),
        emgD_Remarks: z.string().optional(),
        emgD_ActiveFlag: z.boolean().default(true)
    })
    // ✅ Add mutual validation between From and To
    .refine((data) => data.emgD_From <= data.emgD_To, {
        path: ['emgD_From'],
        message: "'From' value cannot be greater than 'To' value"
    })
    .refine((data) => data.emgD_To >= data.emgD_From, {
        path: ['emgD_To'],
        message: "'To' value cannot be less than 'From' value"
    });
// Master Grade Schema
export const masterGradeSchema = {
    addOrUpdate: z.object({
        emgR_Id: z.number().optional(),
        mI_Id: z.number().optional(),
        emgR_GradeName: createCustomStringSchema('Grade Name', 1, 100),
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
        emG_GroupName: createCustomStringSchema('Subject Group Name', 1, 100),

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
    }),

    delete: z.object({
        emG_Id: z.number({ required_error: 'emG_Id is required' })
    })
};

export const masterCategorySchema = {
    addOrUpdate: z.object({
        emcA_Id: z.number().optional(), // For update case
        mI_Id: z.number().optional(), // Optional, defaults can be set in form if needed

        emcA_CategoryName: createCustomStringSchema('Category Name', 1, 100),

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
        emcA_Id: z.number().min(1, { message: 'Category is required' }),
        mI_Id: z.number().min(1, { message: 'MI Id is required' }),
        ecaC_Id: z.number().optional().default(0),
        asmaY_Id: z.number().min(1, { message: 'Academic Year is required' }),
        asmcL_Id: z.number().min(1, { message: 'Class is required' }),

        section_list: z
            .array(
                z.object({
                    asmS_Id: z.number().min(1, { message: 'Section is required' })
                })
            )
            .min(1, { message: 'At least one section must be selected' })
    })
};
export const coScholasticActivitySchema = {
    addOrUpdate: z.object({
        ecacT_Id: z.number().optional(),
        mI_Id: z.number(),
        ecacT_SkillName: z.string().min(1, { message: 'Co-Scholastic Activity Name is required' }),
        ecacT_SkillCode: z.string().min(1, { message: 'Co-Scholastic Activity is required' })
    }),
    delete: z.object({
        ecacT_Id: deleteIdSchema('ecacT_Id')
    })
};
export const coScholasticAreaSchema = {
    addOrUpdate: z.object({
        ecactA_Id: z.number().optional(),
        mI_Id: z.number(),
        ecactA_SkillArea: z.string().min(1, { message: 'Co-Scholastic Area Name is required' }),
        ecactA_SkillOrder: z.coerce.number().min(1, { message: 'Co-Scholastic Activity Order is required' })
    }),
    delete: z.object({
        ecactA_Id: deleteIdSchema('ecactA_Id')
    })
};

export const masterLifeSkillSchema = {
    addOrUpdate: z.object({
        ecS_Id: z.number().int({ message: 'Life Skill ID is required' }).optional(),
        mI_Id: z.number().int({ message: 'MI ID is required' }).optional(),
        ecS_SkillName: createCustomStringSchema('Life Skill Name', 1, 100),
        ecS_SkillCode: createStringSchema('Life Skill Code', 1, 50),
        ecS_ActiveFlag: z.boolean({ required_error: 'Active Flag is required' }).default(true)
    }),

    delete: z.object({
        ecS_Id: deleteIdSchema('ecS_Id')
    })
};

export const lifeSkillAreaSchema = {
    addOrUpdate: z.object({
        ecS_Id: z.number().default(0),
        mI_Id: z.number().default(30),
        ecS_SkillName: z
            .string()
            .min(1, { message: 'Skill Name is required' })
            .max(100, { message: 'Skill Name must be less than 100 characters' }),
        ecS_SkillCode: z
            .string()
            .min(1, { message: 'Skill Code is required' })
            .max(50, { message: 'Skill Code must be less than 50 characters' }),

        subexamDTO: z
            .array(
                z.object({
                    ecsA_Id: z.number().default(0),
                    ecsA_SkillOrder: z
                        .number({ invalid_type_error: 'Skill Order must be a number' })
                        .min(1, { message: 'Skill Order is required' }),
                    ecsA_SkillArea: z
                        .string()
                        .min(1, { message: 'Skill Area is required' })
                        .max(100, { message: 'Skill Area must be less than 100 characters' })
                })
            )
            .min(1, { message: 'At least one skill area is required' }),

        mappingDTO: z.array(
            z.object({
                ecsaM_Id: z.number().default(0),
                asmaY_Id: z.number().default(0),
                mI_Id: z.number().default(30),
                ecS_Id: z.number().default(0),
                ecsA_Id: z.number().default(0),
                ecsaM_IndicatorDescription: z.string().optional().default(''),
                emgR_Id: z.number().default(0),
                ecsaM_ActiveFlag: z.boolean().default(true)
            })
        )
    }),
    delete: z.object({
        ecsA_Id: deleteIdSchema('ecsA_Id')
    })
};

export const lifeSkillAreaMappingSchema = {
    addOrUpdate: z.object({
        ecS_Id: z.number().default(0),
        mI_Id: z.number().default(30),
        ecS_SkillName: createCustomStringSchema('Skill Name', 1, 100),
        ecS_SkillCode: createStringSchema('Skill Code', 1, 50),

        subexamDTO: z
            .array(
                z.object({
                    ecsA_Id: z.number().default(0),
                    ecsA_SkillOrder: z
                        .number({
                            required_error: 'Skill Area Order is required',
                            invalid_type_error: 'Skill Area Order must be a number'
                        })
                        .int()
                        .min(1, { message: 'Skill Area Order must be at least 1' }),
                    ecsA_SkillArea: createCustomStringSchema('Skill Area Name', 1, 100)
                })
            )
            .min(1, { message: 'At least one Skill Area entry is required' }),

        mappingDTO: z
            .array(
                z.object({
                    ecsaM_Id: z.number().default(0),
                    asmaY_Id: z.number({ required_error: 'Academic Year is required' }).int({ message: 'Academic Year must be integer' }),
                    mI_Id: z.number({ required_error: 'MI ID is required' }).int(),
                    ecS_Id: z.number({ required_error: 'Life Skill ID is required' }).int(),
                    ecsA_Id: z.number({ required_error: 'Skill Area ID is required' }).int(),
                    ecsaM_IndicatorDescription: createCustomStringSchema('Indicator Description', 1, 300),
                    emgR_Id: z.number({ required_error: 'Grade ID is required' }).int(),
                    ecsaM_ActiveFlag: z.boolean().default(true)
                })
            )
            .min(1, { message: 'At least one mapping record is required' })
    }),

    delete: z.object({
        ecsaM_Id: deleteIdSchema('ecsaM_Id')
    })
};
