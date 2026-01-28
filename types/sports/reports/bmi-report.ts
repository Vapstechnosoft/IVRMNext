import { z } from 'zod';

// Interface for Grid Data
export interface IBMIReport {
    AMST_Id: number;
    AMST_Name: string;
    AMST_AdmNo: string;
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    SPCCMH_HouseName: string;
    AMST_DOB: string;
    SPCCSH_Age: string;
    SPCCSH_Height: number;
    SPCCSH_Weight: number;
    SPCCSH_BMI: number;
    SPCCSH_BMIRemarks: string;
}

// Interface for Initial Load Data
export interface IBMIReportLoadData {
    academicYear: { asmaY_Id: number; asmaY_Year: string; Selected: boolean }[];
    houseList: { spccmH_Id: number; spccmH_HouseName: string; Selected: boolean }[];
}


// Interface for Form Request
export interface IBMIReportRequest {
    ASMAY_Id: number;
    ASMCL_Id?: number;
    // ASMS_Id is handled via selectedSectionlist for multi-select
    Type: 'House' | 'CS';
    SPCCMH_Id?: number; // For House selection
    selectedSectionlist?: { asmS_Id: number }[];
}

// Zod Schema for Validation
export const bmiReportSchema = z.object({
    ASMAY_Id: z.coerce.number().min(1, 'Academic Year is required'),
    Type: z.enum(['House', 'CS']),
    SPCCMH_Id: z.coerce.number().optional(),
    ASMCL_Id: z.coerce.number().optional(),
    // We will handle conditional validation in the component or via refined schema
    selectedSectionlist: z.array(z.object({ asmS_Id: z.number() })).optional(),
}).superRefine((data, ctx) => {
    if (data.Type === 'House') {
        if (!data.SPCCMH_Id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'House is required',
                path: ['SPCCMH_Id'],
            });
        }
    } else {
        if (!data.ASMCL_Id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Class is required',
                path: ['ASMCL_Id'],
            });
        }
        if (!data.selectedSectionlist || data.selectedSectionlist.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'At least one section is required',
                path: ['searchchkbx'], // Mapping to a UI field name if possible, or handle generic error
            });
        }
    }
});

export type BMIReportFormSchema = z.infer<typeof bmiReportSchema>;
