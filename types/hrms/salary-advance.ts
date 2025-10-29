// Salary Advance Types

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

// Onload Request
export interface SalaryAdvanceOnloadRequest {
    roleId: number;
}

// Dropdown Types
export interface EmployeeDropdown {
    HRME_Id: number;
    HRME_EmployeeCode: string;
    HRME_EmployeeFirstName: string;
    HRME_EmployeeMiddleName: string | null;
    HRME_EmployeeLastName: string | null;
    HRMD_DepartmentName?: string;
    HRMDES_DesignationName?: string;
}

export interface LeaveYearDropdown {
    HRMLY_Id: number;
    HRMLY_LeaveYear: string;
    HRMLY_FromDate: string;
    HRMLY_ToDate: string;
}

export interface MonthDropdown {
    IVRM_Month_Id: number;
    IVRM_Month_Name: string;
}

export interface ModeOfPaymentDropdown {
    value: string;
    label: string;
}

// Salary Advance Item
export interface SalaryAdvanceItem {
    HRESA_Id: number;
    MI_Id: number;
    HRME_Id: number;
    HRESA_EntryDate: string;
    HRESA_AdvYear: number;
    HRESA_AdvMonth: string;
    HRESA_AppliedAmount: number;
    HRESA_SanctinedAmount: number;
    HRESA_Remarks: string;
    HRESA_AdvStatus: string;
    HRESA_ModeOfPayment: string;
    HRESA_ReferenceNo: number;
    HRESA_ActiveFlag: boolean;
    HRME_EmployeeFirstName?: string;
    HRME_EmployeeMiddleName?: string;
    HRME_EmployeeLastName?: string;
    HRME_EmployeeCode?: string;
}

// Onload Response
export interface SalaryAdvanceOnloadResponse {
    HRESA_Id: number;
    MI_Id: number;
    HRME_Id: number;
    empadvaList: SalaryAdvanceItem[];
    employeedropdown: EmployeeDropdown[];
    leaveyeardropdown: LeaveYearDropdown[];
    monthdropdown: MonthDropdown[];
    modeOfPaymentdropdown: ModeOfPaymentDropdown[];
    retrunMsg: string;
    roleId: number;
}

// Save Request
export interface SalaryAdvanceSaveRequest {
    HRESA_Id: number;
    MI_Id: number;
    HRME_Id: number;
    HRESA_EntryDate: string;
    HRESA_AdvYear: number;
    HRESA_AdvMonth: string;
    HRESA_AppliedAmount: number;
    HRESA_SanctinedAmount: number;
    HRESA_Remarks: string;
    HRESA_AdvStatus: string;
    HRESA_ModeOfPayment: string;
    HRESA_ReferenceNo: number;
    HRESA_ActiveFlag: boolean;
    roleId: number;
}

// Save Response
export interface SalaryAdvanceSaveResponse {
    HRESA_Id: number;
    retrunMsg: string;
    roleId: number;
}

// Delete Request
export interface SalaryAdvanceDeleteRequest {
    HRESA_Id: number;
    roleId: number;
}
