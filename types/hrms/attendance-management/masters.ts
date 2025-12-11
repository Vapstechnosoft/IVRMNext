/**
 * HRMS Attendance Management Masters Types
 * Following the new architecture pattern with lowercase field names
 */

// Shift Setting Master Types
export interface IMasterShiftSettingList {
    FOMST_Id: number;
    FOMS_Id: number;
    FOMS_ShiftName: string;
    FOMS_ActiveFlg: boolean;
    FOMST_FDWHrMin: string; // Total working hours per shift
    FOMST_HDWHrMin: string; // Half day working hours per shift
    FOMST_IHalfLoginTime: string; // Shift Start Time
    FOMST_IHalfLogoutTime: string; // Lunch start time
    FOMST_IIHalfLoginTime: string; // Lunch End time
    FOMST_IIHalfLogoutTime: string; // Shift End Time
    FOMST_DelayPerShiftHrMin: string; // Delay per shift
    FOMST_EarlyPerShiftHrMin: string; // Early per shift
    FOMST_LunchHoursDuration: string; // Lunch Hours
    FOMST_BlockAttendance: string;
    FOMST_FixTimings: string;
}

// Master Holiday Types
export interface IMasterHolidayList {
    fohwdT_Id: number;
    fomhwdD_Id: number;
    fomhwdD_Name: string;
    fomhwdD_FromDate: string;
    fomhwdD_ToDate: string;
    fomhwD_ActiveFlg: boolean;
    fohtwD_HolidayWDType: string;
    hrmD_DepartmentName: string;
}

// Employee Shift Mapping Types
export interface IMasterEmployeeShiftMappingList {
    FOEST_Id: number | null;
    EmployeeName: string | null;
    ShiftName: string | null;
    DayType: string | null;
    Date: string | null;
    FDWHrMin: string | null;
    HDWHrMin: string | null;
    IHalfLogin: string | null;
    IHalfLogout: string | null;
    IIHalfLogin: string | null;
    IIHalfLogout: string | null;
    DelayPerShift: string | null;
    EarlyPerShift: string | null;
    LunchDuration: string | null;
}

