import { z } from 'zod';

// Schema for the form
export const SRKVSSportsReportRecordSchema = z.object({
    ASMAY_Id: z.number().min(1, { message: 'Academic Year is required' }),
    SPCCME_Id: z.number().min(1, { message: 'Event is required' }),
    Type: z.enum(['Record', 'Start', 'Finish', 'Consolidated', 'Indoor', 'Outdoor', 'Team', 'Externals', 'Selection'], {
        required_error: 'Report Type is required',
    }),

    // Optional/Conditional Fields
    Meet_Year: z.string().optional(),
    FromDate: z.date({ required_error: 'Date is required' }).optional(),

    // Multi-select or Single Select based on Type
    selectedCompetitionLevels: z.array(z.object({ spccmcL_Id: z.number() })).optional(),
    spccmcL_Id: z.number().optional(),

    selectedCategories: z.array(z.object({ spccmcC_Id: z.number() })).optional(),
    spccmcC_Id: z.number().optional(),

    // Specific Event Fields
    spccmsccG_Id: z.number().optional(), // Main Event (Group)
    spccmscC_Id: z.number().optional(), // Sub Event
    spccmsccG_Idsub: z.number().optional(), // Sub Sub Event (Single)

    // Sub Sub Event Multi-select
    selectedSubSubEvents: z.array(z.object({ spccmsccG_Id: z.number() })).optional(),
});

export type SRKVSSportsReportRecordFormSchema = z.infer<typeof SRKVSSportsReportRecordSchema>;

// API Response Interfaces
export interface ISRKVSYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface ISRKVSMasterEvent {
    spccmE_Id: number;
    spccmE_EventName: string;
}

export interface ISRKVSCompetitionLevel {
    spccmcL_Id: number;
    spccmcL_CompitionLevel: string;
}

export interface ISRKVSCategory {
    spccmcC_Id: number;
    spccmcC_CompitionCategory: string;
}

export interface ISRKVSMainEvent { // getMasterEvent
    spccmsccG_Id: number;
    spccmsccG_SportsCCGroupName: string;
}

export interface ISRKVSSubEvent { // sportsCCList
    spccmscC_Id: number;
    spccmscC_SportsCCName: string;
}

export interface ISRKVSSubSubEvent { // getsubsubevent
    spccmsccG_Id: number;
    spccmsccG_SportsCCGroupName: string;
}

export interface ISRKVSInitialData {
    yearlist: ISRKVSYear[];
    masterEvent: ISRKVSMasterEvent[];
    competetionLevel: ISRKVSCompetitionLevel[];
    categoryList: ISRKVSCategory[];
    getMasterEvent: ISRKVSMainEvent[]; // Main Event dropdown
    sportsCCList?: ISRKVSSubEvent[]; // Sub Event dropdown (from get_class or get_SportsName)
    getsubsubevent?: ISRKVSSubSubEvent[]; // Sub Sub Event dropdown
}

// Flat report item from API
export interface ISRKVSReportItem {
    AMST_Id: number;
    AMAY_RollNo: string;
    AMST_FirstName: string;
    AMST_AdmNo: string;
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    SPCCESTR_Rank: string;
    SPCCESTR_Value: string;
    SPCCMUOM_UOMName: string;
    SPCCME_EventName: string;
    SPCCMSCCG_SportsCCGroupName: string;
    ASMAY_Year?: string;
    SPCCMCC_CompitionCategory: string;
    SPCCMCL_Id: number;
    SPCCMSCCG_Id: number;
    SPCCEST_Remarks?: string;
    [key: string]: any;
}

// Grouped data for UI
export interface ISRKVSReportData {
    SPCCMCC_Id?: number;
    SPCCMCC_CompitionCategory: string;
    SPCCMCL_Id?: number;
    spccmcL_CompitionLevel?: string;
    SPCCMSCCG_Id?: number;
    SPCCMSCCG_SportsCCGroupName?: string;
    SPCCEST_Remarks?: string;
    SPCCMUOM_UOMName?: string;
    RecordDetails: ISRKVSReportItem[];
}
