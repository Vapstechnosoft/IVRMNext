/**
 * Types for Shift Setting Master API
 */

export interface ShiftSettingMasterType {
    fohwdT_Id: number;
    mI_Id: number;
    fohtwD_HolidayWDType: string;
    fohtwD_HolidayWDTypeFlag: string;
    fohwdT_ActiveFlg: boolean;
    fohtwD_HolidayFlag: boolean;
    createdDate: string | null;
    updatedDate: string | null;
}

export interface ShiftSettingMasterReportListItem {
    // Add fields based on actual API response when available
    // For now, using placeholder structure
    [key: string]: any;
}

export interface ShiftSettingMasterGetDataResponseData {
    types: ShiftSettingMasterType[];
    report_list: ShiftSettingMasterReportListItem[];
}

export interface ShiftSettingMasterGetDataResponse {
    success: boolean;
    message: string;
    data: ShiftSettingMasterGetDataResponseData;
    total: number;
    page: number;
    page_size: number;
}

