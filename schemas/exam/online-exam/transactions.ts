import { z } from 'zod';

// Answer Paper Correction Filter Schema
export const answerPaperFilterSchema = z.object({
    asmaY_Id: z.coerce.number({ required_error: 'Academic Year is required' }).min(1, 'Select Academic Year'),
    asmcL_Id: z.coerce.number({ required_error: 'Class is required' }).min(1, 'Select Class'),
    asmS_Id: z.coerce.number({ required_error: 'Section is required' }).min(1, 'Select Section'),
    ismS_Id: z.coerce.number({ required_error: 'Subject is required' }).min(1, 'Select Subject'),
    lpmoeeX_Id: z.coerce.number({ required_error: 'Exam Name is required' }).min(1, 'Select Exam Name')
});

// Single Question Evaluation Schema
export const questionEvaluationSchema = z.object({
    questionId: z.number(),
    awardedMarks: z.coerce.number().min(0, 'Marks cannot be negative'),
    teacherRemarks: z.string().optional()
});

// Save Answer Paper Evaluation Schema
export const saveEvaluationSchema = z.object({
    amsT_Id: z.number(),
    lpmoeeX_Id: z.number(),
    evaluations: z.array(questionEvaluationSchema)
});

// Publish To Student Portal Filter Schema
export const publishFilterSchema = z.object({
    asmaY_Id: z.coerce.number({ required_error: 'Academic Year is required' }).min(1, 'Select Academic Year'),
    asmcL_Id: z.coerce.number({ required_error: 'Class is required' }).min(1, 'Select Class'),
    asmS_Id: z.coerce.number({ required_error: 'Section is required' }).min(1, 'Select Section'),
    ismS_Id: z.coerce.number().optional(),
    lpmoeeX_Id: z.coerce.number({ required_error: 'Exam Name is required' }).min(1, 'Select Exam Name')
});

// Bulk Publish Action Schema
export const bulkPublishSchema = z.object({
    lpmoeeX_Id: z.number(),
    studentIds: z.array(z.number()).min(1, 'Please select at least one student'),
    publishStatus: z.boolean().default(true)
});
