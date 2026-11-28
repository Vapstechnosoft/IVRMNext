export interface ITimetableDay {
    ttmD_Id: number;
    ttmD_DayName: string;
    ttmD_DayCode?: string;
    ttmD_DayOrder?: number;
    Selected?: boolean;
    [key: string]: any;
}

export interface ITimetablePeriod {
    ttmP_Id: number;
    ttmP_PeriodName: string;
    ttmP_PeriodOrder?: number;
    [key: string]: any;
}

export interface ITimetableClassSectionAllocation {
    period: string;
    p_Days: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    ismS_SubjectName: string;
    ttmD_Id?: number;
    ttmP_Id?: number;
    asmcL_Id?: number;
    asmS_Id?: number;
    ismS_Id?: number;
    hrmE_Id?: number;
    ttmB_BreakName?: string;
    ttmB_AfterPeriod?: number;
    [key: string]: any;
}

export interface ITimetableDayCount {
    dayName: string;
    periodCount: number;
    [key: string]: any;
}

export interface IDailyTimetableItem {
    ttmdpT_StartTime?: string;
    ttmdpT_EndTime?: string;
    period?: string;
    asmcL_ClassName?: string;
    asmC_SectionName?: string;
    ismS_SubjectName?: string;
    [key: string]: any;
}

export interface IEmployeeTimetableResponse {
    tT_final_generation?: ITimetableDayCount[];
    allperiods?: ITimetableDay[];
    periods?: ITimetablePeriod[];
    class_sectons?: ITimetableClassSectionAllocation[];
    class_sections?: ITimetableClassSectionAllocation[];
    [key: string]: any;
}

export interface IEmployeeDailyTimetableResponse {
    class_sectons?: IDailyTimetableItem[];
    class_sections?: IDailyTimetableItem[];
    tT_final_generation?: any[];
    [key: string]: any;
}
