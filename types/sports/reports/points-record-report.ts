
export interface IYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface IClass {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

export interface ISection {
    asmS_Id: number;
    asmC_SectionName: string;
}

export interface IHouse {
    spccmH_Id: number;
    spccmH_HouseName: string;
}

export interface IEvent {
    spccmE_Id: number;
    spccmE_EventName: string;
}

export interface ISports {
    spccmscC_Id: number;
    spccmscC_SportsCCName: string;
}

export interface ICategory {
    spccmcC_Id: number;
    spccmcC_CompitionCategory: string;
}

export interface IPlace {
    spccestR_Rank: string;
}

export interface IPointsRecordReportData {
    AMST_AdmNo: string;
    AMST_Name: string;
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    SPCCESTR_Points: number;
    SPCCESTR_Rank: string;
    SPCCE_StartDate: string;
    SPCCMEV_EventVenue: string;
    SPCCME_EventName: string;
    SPCCMH_HouseName: string;
    ASMCL_Id: number;
    ASMS_Id: number;
    SPCCME_Id: number;
    AMST_Id: number;
    SPCCMSCC_SportsCCName: string;
    SPCCMSCC_Id: number;
    ASMAY_Year: string;
    SPCCESTR_Remarks: string;
    // Fields used in SportPointsAndRecordReport grid
    amst_Id?: number;
    adm_no?: string;
    studentname?: string;
    spccestR_Place?: string;
    spccestR_Points?: number;
    spccmD_DivisionName?: string;
    spccmH_HouseName?: string;
}

export interface IPointsRecordReportLoadData {
    academicYear: IYear[];
    yearlist: IYear[]; // keep for compatibility if needed
    venueList: any[];
    eventList: IEvent[];
    sportslist: ISports[];
    categoryList: ICategory[];
    houseList: IHouse[];
    events: any[]; // Program Master (SPCCP_Id/Name etc)
    divisionList: any[];
}

export interface IPointsRecordReportRequest {
    type: 'House' | 'CS' | 'CC';
    asmaY_Id: number;
    asmcL_Id?: number;
    spccmcC_Id?: number;
    selectedhouselist: { spccmH_Id: number }[];
    selectedSectionlist: { asmS_Id: number }[];
    selectedeventlist: { spccmE_Id: number }[];
    selectedsportslist: { spccmscC_Id: number }[];
    placListData: { spccestR_Rank: string }[];
}

import { z } from 'zod';

export const SportPointsAndRecordReportSchema = z.object({
    qualification_type: z.enum(['eca', 'cca', 'ih', 'others']),
    ASMAY_Id: z.number().min(1, 'Academic Year is required'),
    SPCCMH_Id: z.number().min(1, 'House Name is required'),
    SPCCE_Id: z.number().min(1, 'Program Master is required'),
    SPCCME_Id: z.number().min(1, 'Event Name is required'),
    SPCCMD_Id: z.number().min(1, 'Division Name is required'),
});

export type SportPointsAndRecordReportFormSchema = z.infer<typeof SportPointsAndRecordReportSchema>;


