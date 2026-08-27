export interface IDeputationForm {
    asmaY_Id: string;
    ttmD_Date: Date;
    absent_Staff_Flag: boolean;
    hrE_Id: string;
    ttmD_Day: string;
    ttmD_Remarks: string;
    sms_Flag: boolean;
    email_Flag: boolean;
    notification_Flag: boolean;
}

export interface IStaffDropdown {
    hrmE_Id: number;
    staffName?: string;
    hrmE_EmployeeFirstName?: string;
}

export interface IAcademicYearDropdown {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface IDeputationInitialData {
    acayear?: any[];
    categorylist?: any[];
    stafflist?: any[];
    classlist?: any[];
    daylist?: any[];
    absentstafflist?: any[];
    [key: string]: any;
}

export interface IAbsentStaffPayload {
    ttsD_Date: string;
    absflag: boolean;
    ttmD_Id?: number;
    ttmP_Id?: number;
    hrmE_Id?: number;
}

export interface IPeriodAllotedPayload {
    hrmE_Id: number;
    ttmD_Id: number;
    ttsD_Date: string;
}

export interface IFreeStaffPayload {
    ttsD_Date: string;
    absflag: boolean;
    ttmD_Id: number;
    ttmP_Id: number;
    hrmE_Id: number;
}

export interface IViewRecordsPopupPayload {
    ttsD_Date: string;
    absflag: boolean;
    ttmD_Id?: number;
    ttmP_Id?: number;
    hrmE_Id?: number;
}

export interface ISaveDeputationPayload {
    ttmD_Id: number;
    ttsD_AbsentStaff: number;
    ttsD_DeputedStaff: number;
    ttsD_Date: string;
    ttmP_Id: number;
    asmcL_Id?: number;
    asmS_Id?: number;
    ttsD_Remarks?: string;
    smsflag?: boolean;
    mailflag?: boolean;
    noT_Flag?: boolean;
}

