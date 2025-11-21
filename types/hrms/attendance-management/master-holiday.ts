/**
 * Master Holiday API Types
 */

// Request Types
export interface MasterHolidayGetDataRequest {
    page: number;
    page_size: number;
    search_query: string;
    search_column: string;
    sort_column: string;
    sort_direction: string;
    is_export: boolean;
    miid: number;
    loginUserId: number;
    userRole: string;
}

// Response Types
export interface YearDropdown {
    hrmlY_Id: number;
    mI_Id: number;
    hrmlY_LeaveYear: string;
    hrmlY_FromDate: string;
    hrmlY_ToDate: string;
    hrmlY_ActiveFlag: boolean;
    hrmlY_LeaveYearOrder: number;
    createdDate: string | null;
    updatedDate: string | null;
}

export interface DepartmentType {
    hrmD_Id: number;
    mI_Id: number;
    hrmD_DepartmentName: string;
    hrmD_Order: number;
    hrmD_ActiveFlag: boolean;
    hrmdC_ID: number | null;
    hrmD_InternalTrainingMinimumHrs: number;
    createdDate: string | null;
    updatedDate: string | null;
}

export interface HolidayType {
    fohwdT_Id: number;
    mI_Id: number;
    fohtwD_HolidayWDType: string;
    fohtwD_HolidayWDTypeFlag: string;
    fohwdT_ActiveFlg: boolean;
    fohtwD_HolidayFlag: boolean;
    createdDate: string | null;
    updatedDate: string | null;
}

export interface DayListItem {
    fomD_Id: number;
    mI_Id: number;
    asmcL_Id: number;
    fomD_DayName: string;
    fomD_DayCode: string;
    fomD_ActiveFlag: boolean;
    createdDate: string | null;
    updatedDate: string | null;
}

export interface ReportListItem {
    FOHWDT_Id: number;
    FOMHWDD_Id: number;
    FOMHWDD_Name: string;
    FOMHWDD_FromDate: string;
    FOMHWDD_ToDate: string;
    FOMHWD_ActiveFlg: boolean;
    FOHTWD_HolidayWDType: string;
    HRMD_DepartmentName: string;
}

export interface MasterHolidayGetDataResponseData {
    yeardropdown: YearDropdown[];
    departmentType: DepartmentType[];
    holidayType: HolidayType[];
    dayslist: DayListItem[];
    report_list: ReportListItem[];
}

export interface MasterHolidayGetDataResponse {
    success: boolean;
    message: string;
    data: MasterHolidayGetDataResponseData;
    total: number;
    page: number;
    page_size: number;
}

// Save Request Types
export interface SelectedDayDate {
    date: string;
    dayname: string;
}

export interface MasterHolidaySaveRequest {
    mI_Id: number;
    hrmlY_Id: number;
    fohwdT_Id: number;
    hrmD_Id: number;
    day_flag: boolean;
    fO_Start_Date: string | null;
    fomhwdD_ToDate: string | null;
    fomhwD_HolidayWDName: string;
    userid: number;
    selectedDaysDate: SelectedDayDate[];
}

