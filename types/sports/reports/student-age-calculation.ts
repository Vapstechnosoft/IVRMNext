import { z } from 'zod';

export interface IStudentAgeReport {
    amsT_Id: number;
    amsT_FirstName?: string;
    amsT_MiddleName?: string;
    amsT_LastName?: string;
    amsT_Name: string;
    amsT_Admno: string;
    asmcL_Classname: string;
    asmC_Sectionname: string;
    spccmH_Housename?: string;
    amsT_DOb: string | Date;
    years: number;
    months: number;
    monthsd: number;
    days?: number;
    spccmcL_compitionLevel?: string;
}

export interface IReportRequest {
    type: 'House' | 'CS'; // 'CS' for Class/Section
    asmaY_Id: number;
    asmcL_Id?: number;
    spccmcC_Id?: number;
    selectedhouselist?: { spccmH_Id: number }[];
    selectedSectionlist?: { asmS_Id: number }[];
    search_column?: string;
    search_query?: string;
}

export interface IStudentAgeCalculationDropdowns {
    yearlist: {
        asmaY_Id: number;
        asmaY_Year: string;
    }[];
    categoryList?: {
        spccmcC_Id: number;
        spccmcC_CompitionCategory: string;
    }[];
    classList?: {
        asmcL_Id: number;
        asmcL_ClassName: string;
    }[];
    houseList?: {
        spccmH_Id: number;
        spccmH_HouseName: string;
    }[];
    sectionList?: {
        asmS_Id: number;
        asmC_SectionName: string;
    }[];
}


export const StudentAgeReportSchema = z.object({
    type: z.enum(['House', 'CS']),
    asmaY_Id: z.coerce.number().min(1, 'Academic Year is required'),
    spccmcC_Id: z.coerce.number().optional(),
    asmcL_Id: z.number().optional(),
    selectedhouselist: z.array(z.object({ spccmH_Id: z.number() })).optional(),
    selectedSectionlist: z.array(z.object({ asmS_Id: z.number() })).optional(),
}).refine(data => {
    if (data.type === 'CS') {
        return !!data.asmcL_Id;
    }
    return true;
}, {
    message: "Class is required for Class/Section report",
    path: ["asmcL_Id"]
}).refine(data => {
    if (data.type === 'CS') {
        return data.selectedSectionlist && data.selectedSectionlist.length > 0;
    }
    return true;
}, {
    message: "At least one section must be selected",
    path: ["selectedSectionlist"]
}).refine(data => {
    return data.selectedhouselist && data.selectedhouselist.length > 0;
}, {
    message: "At least one house must be selected",
    path: ["selectedhouselist"]
});

export type StudentAgeReportFormSchema = z.infer<typeof StudentAgeReportSchema>;
