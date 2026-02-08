export interface SubjectRestrictionDayPeriodGridData {
    ttrdP_Id: number;
    asmaY_Year: string;
    ttmC_CategoryName: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    staffName: string;
    ismS_SubjectName: string;
    ttmP_PeriodName: string;
    ttmD_DayName: string;
    ttrdP_ActiveFlag: boolean;
}

export interface SubjectRestrictionDaySubjectGridData {
    ttrdsU_Id: number; //id
    asmaY_Year: string; //academic year
    ismS_SubjectName: string; //subject
    ttmD_Id: number; //day
    ttmD_DayName: string; //day
    ttrdsU_SUbSelcFlag: boolean;  //action
    ttrdsU_ActiveFlag: boolean; //action
}

export interface SubjectRestrictionDayStaffGridData {
    ttrdsU_Id: number; //id
    asmaY_Year: string; //academic year
    staffName: string; //staff
    ttmD_Id: number; //day
    ttmD_DayName: string; //day
    ttrdsU_SUbSelcFlag: boolean;  //action
    ttrdsU_ActiveFlag: boolean; //action
}

export interface SubjectRestrictionPeriodStaffGridData {
    ttrpS_Id: number; //id
    asmaY_Year: string; //academic year
    staffName: string; //staff
    ttmD_Id: number; //day
    ttmP_PeriodName: string; //period
    ttrpS_SUbSelcFlag: boolean;  //action
    ttrpS_ActiveFlag: boolean; //action
}

export interface SubjectRestrictionPeriodSubjectGridData {
    ttrpsU_Id: number; //id
    asmaY_Year: string; //academic year
    ismS_SubjectName: string; //subject
    ttmP_Id: number; //day
    ttmP_PeriodName: string; //period
    ttrpsU_SUbSelcFlag: boolean;  //action
    ttrpsU_ActiveFlag: boolean; //action
}

// TTRPSU_Id = g.TTRPSU_Id,
// ASMAY_Year = a.ASMAY_Year,
// ISMS_SubjectName = e.ISMS_SubjectName,
// TTMP_Id = g.TTMP_Id,
// TTMP_PeriodName = b.TTMP_PeriodName,
// TTRPSU_SUbSelcFlag = g.TTRPSU_SUbSelcFlag,
// TTRPSU_ActiveFlag = g.TTRPSU_ActiveFlag,

    // ttrdsU_Id
    // asmaY_Year
    // staffName
    // ttmD_Id
    // ttrdsU_SUbSelcFlag
    // ttrdsU_ActiveFlag