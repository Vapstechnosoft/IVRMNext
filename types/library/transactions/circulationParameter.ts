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

export const circulationParameterSchema = z.object({
    id: z.number().optional(), // LMC_Id
    bookParameterFlag: z.string().default('BP'), // LMB_BookTypeflag
    issuerType: z.string().default('STUDENT'), // schclgflag

    // Book vs Non-Book generic selection
    categoryId: z.number().optional(), // maps to LMC_Id dropdown
    bookType: z.string().optional(), // LMB_BookType

    // Issuer specific IDs
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
});

export type CirculationParameterFormValues = z.infer<typeof circulationParameterSchema>;
