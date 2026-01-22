import { z } from 'zod';

export interface IStudentEligibleReportDetail {
    amsT_Id: number;
    adm_no: string;
    studentname: string;
    classname: string;
    sectionname: string;
    spccE_StartDate: string | Date;
    pasR_Age: string | number;
    amsT_FatherName: string;
    amsT_MotherName: string;
    address: string;
    Selected?: boolean;
}

export interface IStudentEligibleReport {
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    studentList?: IStudentEligibleReportDetail[];
}

export const studentEligibleReportSchema = z.object({
    asmaY_Id: z.coerce.number().min(1, 'Academic Year is required'),
    asmcL_Id: z.coerce.number().min(1, 'Class is required'),
    asmS_Id: z.coerce.number().min(1, 'Section is required'),
    studentList: z.array(z.object({
        amsT_Id: z.number(),
        Selected: z.boolean().optional()
    })).optional()
});
