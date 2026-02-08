export interface TTDayPeriodGridData {
    ttfdP_Id: number; //id
    asmaY_Year: string; //academic year
    ttmC_CategoryName: string; //category
    asmcL_ClassName: string; //class
    asmC_SectionName: string //section
    ismS_SubjectName: string; //subject
    ttmP_PeriodName: number;  //id
    ttmD_DayName: string; //days
    ttfdP_ActiveFlag: boolean; //toggle button
}


export interface TTDaySubjectGridData {
    ttrdsU_Id: number; //id
    asmaY_Year: string; //academic year
    ismS_SubjectName: string; //subject
    ttmD_Id: number;  //id
    ttmD_DayName: string; //days
    ttrdsU_SUbSelcFlag: boolean; //toggle button
    ttrdsU_ActiveFlag: boolean;  //toggle button
}

export interface TTPeriodSubjectGridData {
    ttrpsU_Id: number; //id-TTRPSU_Id 
    asmaY_Year: string; //academic year-ASMAY_Year 
    ismS_SubjectName: string; //subject- ISMS_SubjectName 
    ttmP_Id: number;  //id-TTMP_Id 
    ttmP_PeriodName: string; //period-TTMP_PeriodName 
    ttrpsU_SUbSelcFlag: boolean; //toggle button-TTRPSU_SUbSelcFlag 
    ttrpsU_ActiveFlag: boolean;  //toggle button-TTRPSU_ActiveFlag 
}

export interface TTPeriodStaffGridData {
    ttfpS_Id: number;
    asmaY_Year: string;
    ttmP_Id: number;
    ttmP_PeriodName: string;
    ttfpS_SUbSelcFlag: boolean;
    ttfpS_ActiveFlag: boolean;
    staffName?: string;
}


