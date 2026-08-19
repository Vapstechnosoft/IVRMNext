import { z } from 'zod';

export interface IHouseHeader {
    spccmH_Id: number;
    SPCCMH_HouseName: string;
}

export interface ISportHouseReportPointsItem {
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    [houseName: string]: string | number;
}

export interface IHouseTotalItem {
    ASMCL_ClassName?: string;
    [houseName: string]: string | number | undefined;
}

export interface IOverallCountItem {
    [houseName: string]: string | number | undefined;
}

export interface ISportHouseReportPointsResponse {
    viewlist: ISportHouseReportPointsItem[];
    houseTotal?: IHouseTotalItem[];
    overallCount?: IOverallCountItem[];
    houseList?: IHouseHeader[];
}

export interface ISportHouseReportPointsRequest {
    ASMAY_Id: number;
    Classelectedlist: { asmcL_Id: number; asmcL_ClassName?: string }[];
    selectedhouselist: { spccmH_Id: number; spccmH_HouseName?: string; SPCCMH_HouseName?: string }[];
    selectedSectionlist: { asmS_Id: number; asmC_SectionName?: string }[];
    EME_Id?: number;
}

export interface ISportHouseReportPointsDropdowns {
    yearlist: {
        asmaY_Id: number;
        asmaY_Year: string;
    }[];
    exam_list?: {
        emE_Id: number;
        emE_ExamName: string;
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

export const sportHouseReportPointsSchema = z.object({
    asmaY_Id: z.number({
        required_error: "Please Select Academic Year",
        invalid_type_error: "Please Select Academic Year"
    }).min(1, "Please Select Academic Year"),
    selectedhouselist: z.array(z.object({ spccmH_Id: z.number(), spccmH_HouseName: z.string().optional() })).min(1, "Select House"),
    Classelectedlist: z.array(z.object({ asmcL_Id: z.number(), asmcL_ClassName: z.string().optional() })).min(1, "Select Class Name"),
    selectedSectionlist: z.array(z.object({ asmS_Id: z.number(), asmC_SectionName: z.string().optional() })).min(1, "Select Section"),
    EME_Id: z.number().optional(),
});

export type SportHouseReportPointsFormSchema = z.infer<typeof sportHouseReportPointsSchema>;
