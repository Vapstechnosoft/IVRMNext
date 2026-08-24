import { z } from 'zod';

export interface CirculationParameterPayload {
    LMC_Id?: number;
    LMB_BookType?: string;
    schclgflag?: string; // e.g., "Student", "Staff", "Department", "Guest"
    asmcl_id?: number;
    HRMGT_Id?: number;
    HRMD_Id?: number;
    Guest_Id?: number;
    LMB_BookTypeflag?: string; // 'BP' or 'NBP'
    Max_Issue_Items?: number;
    Max_Issue_Days?: number;
    Max_No_Renewals?: number;
    NonBook_Max_Issue_Items?: number;
    NonBook_Max_Issue_Days?: number;
    NonBook_Max_No_Renewals?: number;
    LMC_CategoryName?: string;
    LMC_Status?: boolean;
}

export const circulationParameterSchema = z
    .object({
        id: z.number().optional(), // LMC_Id
        bookParameterFlag: z.string().default('BP'), // LMB_BookTypeflag
        issuerType: z.string().default('STUDENT'), // schclgflag

        categoryId: z.number().optional(), // maps to LMC_Id dropdown
        bookType: z.string().optional(), // LMB_BookType

        classId: z.number().optional(), // asmcl_id
        employeeGroupId: z.number().optional(), // HRMGT_Id
        departmentId: z.number().optional(), // HRMD_Id
        guestId: z.number().optional(), // Guest_Id

        maxIssueItems: z.number().min(0, { message: 'Must be a positive number' }).optional(),
        maxIssueDays: z.number().min(0, { message: 'Must be a positive number' }).optional(),
        maxRenewals: z.number().min(0, { message: 'Must be a positive number' }).optional(),

        nonBookMaxIssueItems: z.number().min(0).optional(),
        nonBookMaxIssueDays: z.number().min(0).optional(),
        nonBookMaxRenewals: z.number().min(0).optional(),

        categoryName: z.string().optional(), // LMC_CategoryName
        status: z.boolean().default(true)
    })
    .superRefine((data, ctx) => {
        if (data.bookParameterFlag === 'BP' && !data.bookType) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Select Book Type',
                path: ['bookType']
            });
        }
        if (data.bookParameterFlag === 'NBP' && !data.categoryId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Select Category Name',
                path: ['categoryId']
            });
        }

        if (data.issuerType === 'STUDENT' && !data.classId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Select Class',
                path: ['classId']
            });
        }
        if (data.issuerType === 'STAFF' && !data.employeeGroupId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Select Employee Group',
                path: ['employeeGroupId']
            });
        }
        if (data.issuerType === 'DEPARTMENT' && !data.departmentId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Select Department',
                path: ['departmentId']
            });
        }
        if (data.issuerType === 'GUEST' && !data.guestId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Select Guest Name',
                path: ['guestId']
            });
        }
    });

export type CirculationParameterFormValues = z.infer<typeof circulationParameterSchema>;
