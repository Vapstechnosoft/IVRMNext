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
    hrlpC_Id: number;
    mI_Id: number;
    hrlpC_SpOrGenFlg: string;
    hrlpC_PunchGAPTime: string;
    hrlpC_AbsentFlag: string;
    hrlpC_LateInEarlyOutFlag: string;
    hrlpC_LateInRelaxFlag: boolean;
    hrlpC_LateInEarlyOut: string;
    hrlpC_LateInTime: string;
    hrlpC_EarlyOutRelaxFlag: boolean;
    hrlpC_EarlyOutTime: string;
    hrlpC_CummulativeTimeFlag: boolean;
    hrlpC_CummulativeTime: number;
    hrlpC_AfterCummulativeTime: string;
    hrlpC_NoOfLatesFlag: boolean;
    hrlpC_NoofMonthlyLateInExempted: number;
    hrlpC_NoOfLates: number;
    hrlpC_NoOfLatesCFFlag: boolean;
    hrlpC_LeavePrefixSuffixFlag: boolean;
    hrlpC_IncludeHolidayFlag: boolean;
    hrlpC_ActiveFlag: boolean;
    hrlpC_CreeatedDate?: string | null;
    hrlpC_UpdatedDate?: string | null;
    hrlpC_CreatedBy: number;
    hrlpC_UpdatedBy: number;
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
