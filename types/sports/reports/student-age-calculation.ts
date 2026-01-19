import { z } from 'zod';

export interface IStudentAgeReport {
    amsT_Id: number;
    studentName: string;
    amsT_AdmNo: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    spccmH_HouseName?: string;
    amsT_DOB: string | Date;
    months: number;
    years: number;
    monthsd: number;
    days?: number;
    spccmcL_CompitionLevel?: string;
}

export interface IReportRequest {
    type: 'House' | 'CS'; // 'CS' for Class/Section
    asmaY_Id: number;
    asmcL_Id?: number;
    asmS_Id?: number;
    selectedHouseList?: { spccmH_Id: number }[];
    selectedSectionList?: { asmS_Id: number }[];
}

export interface IReportResponse {
    success: boolean;
    viewlist?: IStudentAgeReport[];
    message?: string;
    yearlist?: any[];
    categoryList?: any[];
    classList?: any[];
    houseList?: any[];
    sectionList?: any[];
}


export const studentAgeReportSchema = z.object({
    type: z.enum(['House', 'CS']),
    asmaY_Id: z.coerce.number().min(1, 'Academic Year is required'),
    asmcL_Id: z.number().optional(),
    // asmS_Id is handled via section selection in multi-select for CS or single select technically, but user req showed multi-select checks
    asmS_Id: z.number().optional(),
}).refine(data => {
    if (data.type === 'CS') {
        return !!data.asmcL_Id;
    }
    return true;
}, {
    message: "Class is required for Class/Section report",
    path: ["asmcL_Id"]
});
