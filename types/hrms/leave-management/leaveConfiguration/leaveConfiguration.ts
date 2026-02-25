/**
 * Leave Configuration Types
 * Based on API structure from /api/LeaveConfig/get_leave_configuartion
 */

/**
 * Leave Configuration Data Structure (API Response)
 */
export interface LeaveConfigurationData {
    hrlpC_Id: number;
    mI_Id: number;
    hrlpC_SpOrGenFlg: string; // "G" or "SP"
    hrlpC_PunchGAPTime: string; // Time format "HH:mm"
    hrlpC_AbsentFlag: string; // "Y" or "N"
    hrlpC_LateInEarlyOutFlag: string; // "Y" or "N"
    hrlpC_LateInRelaxFlag: boolean;
    hrlpC_LateInEarlyOut: string; // "LateIn" or "EarlyOut"
    hrlpC_LateInTime: string; // Time in minutes or "HH:mm"
    hrlpC_EarlyOutRelaxFlag: boolean;
    hrlpC_EarlyOutTime: string; // Time in minutes or "HH:mm"
    hrlpC_CummulativeTimeFlag: boolean;
    hrlpC_CummulativeTime: number; // Minutes
    hrlpC_AfterCummulativeTime: string; // "HalfDay" or other
    hrlpC_NoOfLatesFlag: boolean;
    hrlpC_NoofMonthlyLateInExempted: number;
    hrlpC_NoOfLates: number;
    hrlpC_NoOfLatesCFFlag: boolean;
    hrlpC_LeavePrefixSuffixFlag: boolean;
    hrlpC_IncludeHolidayFlag: boolean;
    hrlpC_ActiveFlag: boolean;
    hrlpC_CreeatedDate?: string | null;
    hrlpC_UpdatedDate?: string | null;
    hrlpC_CreatedBy?: number;
    hrlpC_UpdatedBy?: number;
}

/**
 * API Response for GET Leave Configuration
 */
export interface LeaveConfigurationGetResponse {
    success: boolean;
    message: string;
    data: LeaveConfigurationData | null;
    total?: number | null;
    page?: number | null;
    page_size?: number | null;
}

/**
 * API Request for POST/Save Leave Configuration
 */
export interface LeaveConfigurationSaveRequest {
    HRLPC_Id: number;
    MI_Id: number;
    HRLPC_SpOrGenFlg: string;
    HRLPC_PunchGAPTime: string;
    HRLPC_AbsentFlag: string;
    HRLPC_LateInEarlyOutFlag: string;
    HRLPC_LateInRelaxFlag: boolean;
    HRLPC_LateInEarlyOut: string;
    HRLPC_LateInTime: string;
    HRLPC_EarlyOutRelaxFlag: boolean;
    HRLPC_EarlyOutTime: string;
    HRLPC_CummulativeTimeFlag: boolean;
    HRLPC_CummulativeTime: number;
    HRLPC_AfterCummulativeTime: string;
    HRLPC_NoOfLatesFlag: boolean;
    HRLPC_NoofMonthlyLateInExempted: number;
    HRLPC_NoOfLates: number;
    HRLPC_NoOfLatesCFFlag: boolean;
    HRLPC_LeavePrefixSuffixFlag: boolean;
    HRLPC_IncludeHolidayFlag: boolean;
    HRLPC_ActiveFlag: boolean;
    HRLPC_CreeatedDate?: string | null;
    HRLPC_UpdatedDate?: string | null;
    HRLPC_CreatedBy: number;
    HRLPC_UpdatedBy: number;
}

/**
 * Frontend Form Data Structure
 */
export interface LeaveConfigurationFormData {
    id: number;
    spOrGenFlg: string;
    punchGapTime: string;
    absentFlag: string;
    lateInEarlyOutFlag: string;
    lateInRelaxFlag: boolean;
    lateInEarlyOut: string;
    lateInTime: string;
    earlyOutRelaxFlag: boolean;
    earlyOutTime: string;
    cummulativeTimeFlag: boolean;
    cummulativeTime: number;
    afterCummulativeTime: string;
    noOfLatesFlag: boolean;
    noofMonthlyLateInExempted: number;
    noOfLates: number;
    noOfLatesCFFlag: boolean;
    leavePrefixSuffixFlag: boolean;
    includeHolidayFlag: boolean;
    activeFlag: boolean;
}
