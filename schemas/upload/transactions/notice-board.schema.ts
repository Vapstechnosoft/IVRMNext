import { z } from 'zod';

export const noticeBoardSchema = z
    .object({
        intB_Id: z.number().optional().nullable(),
        asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, 'Academic Year is required'),
        ntB_TTSylabusFlg: z.string({ required_error: 'Notice Type is required' }).min(1, 'Notice Type is required'),
        intB_Title: z.string({ required_error: 'Notice Title is required' }).min(1, 'Notice Title is required'),
        intB_Description: z.string().optional().nullable(),
        intB_StartDate: z.date({ required_error: 'Start Date is required' }),
        intB_EndDate: z.date({ required_error: 'End Date is required' }),
        intB_DisplayDate: z.date().optional().nullable(),
        intB_DispalyDisableFlg: z.boolean().default(false),
        intB_ActiveFlag: z.any().default(true),
        intB_ToStaffFlg: z.any().optional(),
        intB_ToStudentFlg: z.any().optional(),
        FilesCount: z.number().optional().default(0),

        // File/URL Attachments
        intB_FilePath_Array: z
            .array(
                z.object({
                    intbfL_Id: z.number().optional(),
                    intbfL_FilePath: z.string().min(1, 'File Path or URL is required'),
                    fileName: z.string().optional(),
                    file: z.any().optional(), // For file upload handling
                    isUploading: z.boolean().optional()
                })
            )
            .optional()
            .default([]),
        intB_UrlPath_Array: z
            .array(
                z.object({
                    intbfL_Id: z.number().optional(),
                    intbfL_FilePath: z.string().min(1, 'URL is required'),
                    fileName: z.string().optional()
                })
            )
            .optional()
            .default([]),

        // Selection Flags
        check_student: z.boolean().default(false),
        check_staff: z.boolean().default(false),
        selectedStudent: z.boolean().optional().default(false),
        selectedRoute: z.boolean().optional().default(false),
        feedefaulters: z.boolean().optional().default(false),

        // Student Selection
        asmcL_Id: z.array(z.object({ asmcL_Id: z.number() })).optional().default([]),
        asmS_Id: z.array(z.object({ asmS_Id: z.number() })).optional().default([]),
        amsT_Id: z.array(z.object({ amsT_Id: z.number() })).optional().default([]),
        ismS_Id: z.array(z.object({ ismS_Id: z.number() })).optional().default([]),

        // Staff Selection
        hrmd_Id: z.array(z.object({ hrmd_Id: z.number() })).optional().default([]),
        hrmdeS_Id: z.array(z.object({ hrmdeS_Id: z.number() })).optional().default([]),
        hrmE_Id: z.array(z.object({ hrmE_Id: z.number() })).optional().default([]),

        // Route & Fee Logic
        select_route: z.boolean().default(false),
        routeList: z.array(z.object({ trmR_Id: z.number() })).optional().default([]),
        
        fee_def: z.boolean().default(false),
        feeGroupList: z.array(z.object({ fmg_Id: z.number() })).optional().default([]),
        feeTermList: z.array(z.object({ fmT_Id: z.number() })).optional().default([]), // Added Fee Term

        // Meta
        intB_FilePath: z.string().optional().nullable(),
        asmaY_Year: z.string().optional(),
        createdDate: z.string().optional(),
        displayDate: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.intB_StartDate && data.intB_EndDate) {
                return data.intB_EndDate >= data.intB_StartDate;
            }
            return true;
        },
        {
            message: 'End Date must be greater than or equal to Start Date',
            path: ['intB_EndDate']
        }
    )
    .refine(
        (data) => {
            if (data.intB_DispalyDisableFlg && data.intB_DisplayDate && data.intB_EndDate) {
                return data.intB_DisplayDate <= data.intB_EndDate;
            }
            return true;
        },
        {
            message: 'Display Date must be less than or equal to End Date',
            path: ['intB_DisplayDate']
        }
    );

export type INoticeBoard = z.infer<typeof noticeBoardSchema>;

