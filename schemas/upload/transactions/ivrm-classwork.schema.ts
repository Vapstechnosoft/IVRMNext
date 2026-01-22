import { z } from 'zod';

export const classWorkSchema = z.object({
  icW_Id: z.number().optional(),
  asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, 'Academic Year is required'),
  asmcL_Id: z.number({ required_error: 'Class is required' }).min(1, 'Class is required'),
  hm_section_list: z
    .array(
      z.object({
        asmS_Id: z.number(),
      })
    )
    .min(1, 'At least one section is required'),
  ismS_Id: z.number({ required_error: 'Subject is required' }).min(1, 'Subject is required'),
  icW_Topic: z.string().min(1, 'Topic is required'),
  icW_SubTopic: z.string().min(1, 'Sub Topic is required'),
  icW_Content: z.string().min(1, 'Content is required'),
  icW_FromDate: z.date({ required_error: 'Start Date is required' }),
  icW_ToDate: z.date({ required_error: 'End Date is required' }),
  icW_Assignment: z.boolean().optional(),
  icW_TeachingAid: z.boolean().optional(),
  icW_Evaluation: z.boolean().optional(),

  icW_ActiveFlag: z.boolean().default(true),
  ismS_SubjectName: z.string().optional(),
  
  // Attachments (Files)
  ICW_FilePath_Array: z.array(
    z.object({
      icW_FilePath: z.string().optional(),
      FileName: z.string().optional(),
    })
  ).optional(),

  // Attachments (URLs) - NEW
  ICW_Attachment_Array: z.array(
    z.object({
      ICW_FilePath: z.string().optional(), // URL
      FileName: z.string().optional(), // In case we need a name, but usually just URL
    })
  ).optional(),

  // Display fields (Joined data)
  asmcL_ClassName: z.string().optional(),
  asmC_SectionName: z.string().optional(),
  createdDate: z.string().optional(),
});

export const studentMarksSchema = z.object({
    amst_Id: z.number(),
    studentName: z.string(),
    rollNo: z.string().optional(),
    admNo: z.string().optional(),
    icwupl_Id: z.number().optional(),
    icwupl_Marks: z.string().optional(),
    icwupl_StaffRemarks: z.string().optional(),
    icwupl_StaffUpload: z.string().optional(),
    icwupl_FileName: z.string().optional(),
    checked: z.boolean().default(false),
    studentUploads: z.array(z.object({
        icwupl_Id: z.number(),
        icwupl_FileName: z.string(),
        icwupl_Attachment: z.string(),
        icwupl_Date: z.string()
    })).optional()
});

export const classWorkMarksListSchema = z.object({
    icW_Id: z.number(),
    students: z.array(studentMarksSchema)
});

export type IClassWork = z.infer<typeof classWorkSchema>;
export type IStudentMarks = z.infer<typeof studentMarksSchema>;
export type IClassWorkMarksList = z.infer<typeof classWorkMarksListSchema>;


export const verifyClassWorkSearchSchema = z.object({
  asmaY_Id: z.number().min(1, 'Academic Year is required'),
  asmcL_Id: z.number().min(1, 'Class is required'),
  asmS_Id: z.number().min(1, 'Section is required'),
  ismS_Id: z.number().min(1, 'Subject is required'),
  from_date: z.date({ required_error: 'Start Date is required' }),
  to_date: z.date({ required_error: 'End Date is required' }),
});

export type IVerifyClassWorkSearch = z.infer<typeof verifyClassWorkSearchSchema>;
