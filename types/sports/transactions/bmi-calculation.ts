import { z } from 'zod';

export interface IStudentBMIEntry {
    amsT_Id: number;
    studentName: string;
    amsT_AdmNo: string;
    spccshW_Weight: number | string;
    spccshW_Height: number | string;
    spccshW_BMI: number | string;
    spccshW_BMIRemark: string;
    selected?: boolean;
}

export interface IBMISection {
    asmS_Id: number;
    asmC_SectionName: string;
}

export interface IBMISectionResponse {
    success: boolean;
    sectionList: IBMISection[];
    message?: string;
}

export interface IBMICalculation {
    spccshW_Id: number;
    asmaY_Id: number;
    asmaY_Year?: string;
    asmcL_Id: number;
    asmcL_ClassName?: string;
    asmS_Id: number;
    asmC_SectionName?: string;
    spccshW_AsOnDate: string | Date;
    asondate?: string;
    studentName?: string;
    amsT_AdmNo?: string;
    spccshW_Weight?: number;
    spccshW_Height?: number;
    spccshW_BMI?: number;
    spccshW_BMIRemark?: string;
    spccmhW_ActiveFlag?: boolean | number;
    student?: IStudentBMIEntry[];
}

export const bmiCalculationSchema = z.object({
    asmaY_Id: z.coerce.number().min(1, 'Academic Year is required'),
    asmcL_Id: z.coerce.number().min(1, 'Class is required'),
    asmS_Id: z.coerce.number().min(1, 'Section is required'),
    spccshW_AsOnDate: z.union([z.string(), z.date()]).refine(val => !!val, 'Date is required'),
    student: z.array(z.object({
        amsT_Id: z.number(),
        studentName: z.string().optional(),
        amsT_AdmNo: z.string().optional(),
        spccshW_Weight: z.coerce.number().min(0, 'Weight must be positive'),
        spccshW_Height: z.coerce.number().min(0, 'Height must be positive'),
        spccshW_BMI: z.coerce.number(),
        spccshW_BMIRemark: z.string(),
        selected: z.boolean().optional()
    })).optional()
});
