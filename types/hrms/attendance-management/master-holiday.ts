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

// Report list item structure from API
// Each item is an object with "master_holiday_report" key containing an array:
// [FOHWDT_Id, FOMHWDD_Id, FOMHWDD_Name, FOMHWDD_FromDate, FOMHWDD_ToDate, FOMHWD_ActiveFlg, FOHTWD_HolidayWDType, HRMD_DepartmentName]
export interface ReportListItem {
    master_holiday_report: [
        number,    // 0: FOHWDT_Id
        number,    // 1: FOMHWDD_Id
        string,    // 2: FOMHWDD_Name
        string,    // 3: FOMHWDD_FromDate
        string,    // 4: FOMHWDD_ToDate
        boolean,   // 5: FOMHWD_ActiveFlg
        string,    // 6: FOHTWD_HolidayWDType
        string     // 7: HRMD_DepartmentName
    ];
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
// API expects exact field names with specific capitalization
export interface SelectedDayDate {
    Date: string;  // Capital D
    Dayname: string;  // Capital D
}

export interface MasterHolidaySaveRequest {
    MI_Id: number;  // Capital M, Capital I
    HRMLY_Id: number;  // All caps
    FOHWDT_Id: number;  // All caps
    HRMD_Id: number;  // All caps
    Day_flag: boolean;  // Capital D
    FO_Start_Date: string | null;  // Capital F, S, D
    FOMHWDD_ToDate: string | null;  // All caps
    FOMHWD_HolidayWDName: string;  // All caps
    Userid: number;  // Capital U
    selectedDaysDate: SelectedDayDate[];
}

