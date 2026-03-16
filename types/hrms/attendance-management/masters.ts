/**
 * HRMS Attendance Management Masters Types
 * Following the new architecture pattern with lowercase field names
 */

// Shift Setting Master Types
export interface IMasterShiftSettingList {
    fomsT_Id: number;
    fomS_Id: number;
    fohwdT_Id?: number;
    fomS_ShiftName: string;
    fomS_ActiveFlg: boolean;
    fomsT_FDWHrMin: string; // Total working hours per shift
    fomsT_HDWHrMin: string; // Half day working hours per shift
    fomsT_IHalfLoginTime: string; // Shift Start Time
    fomsT_IHalfLogoutTime: string; // Lunch start time
    fomsT_IIHalfLoginTime: string; // Lunch End time
    fomsT_IIHalfLogoutTime: string; // Shift End Time
    fomsT_DelayPerShiftHrMin: string; // Delay per shift
    fomsT_EarlyPerShiftHrMin: string; // Early per shift
    fomsT_LunchHoursDuration: string; // Lunch Hours
    fomsT_BlockAttendance: string;
    fomsT_FixTimings: string;
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
    HRMD_DepartmentName?: string;
}

// Employee Shift Mapping Types
export interface IMasterEmployeeShiftMappingList {
    FOEST_Id: number;
    EmployeeName: string;
    ShiftName: string;
    DayType: string;
    Date: string;
    FDWHrMin: string;
    HDWHrMin: string;
    IHalfLogin: string;
    IHalfLogout: string;
    IIHalfLogin: string;
    IIHalfLogout: string;
    DelayPerShift: string;
    EarlyPerShift: string;
    LunchDuration: string;
}

// Employee Shift Mapping Dropdown Types
export interface IGroupType {
    HRMGT_Id: number;
    MI_Id: number;
    HRMGT_EmployeeGroupType: string;
    HRMGT_Code: string;
    HRMGT_Order: number;
    HRMGT_ActiveFlag: boolean;
    CreatedDate: string;
    UpdatedDate: string;
}

export interface IHolidayType {
    key?: number;
    value?: string;
    Key?: number;
    Value?: string;
}

export interface IShiftName {
    Key: number;
    Value: string;
}

export interface IDepartment {
    Key: number;
    Value: string;
}

export interface IDesignation {
    Key: number;
    Value: string;
}

export interface IEmployee {
    Key: number;
    Value: string;
}

export interface IMasterTimeSetting {
    fomtS_Id: number;
    mI_Id: number;
    fomtS_FDWHrMin: string;
    fomtS_HDWHrMin: string;
    fomtS_IHalfLoginTime: string;
    fomtS_IhalfLogoutTime: string;
    fomtS_IIHalfLoginTime: string;
    fomtS_IIHalfLogoutTime: string;
    fomtS_DelayPerShiftHrMin: string;
    fomtS_EarlyPerShiftHrMin: string;
    fomtS_LunchHoursDuration: string;
    fomtS_BlockAttendance: string;
    fomtS_FixTimings: string;
    fomhwD_ActiveFlg: boolean;
}
