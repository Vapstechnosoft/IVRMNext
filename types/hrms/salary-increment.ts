// Salary Increment Types

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

// Employee Dropdown
export interface EmployeeDropdown {
    HRME_Id: number;
    HRME_EmployeeCode: string;
    HRME_EmployeeFirstName: string;
    HRME_EmployeeMiddleName?: string;
    HRME_EmployeeLastName?: string;
}

// Earning/Deduction Type
export interface EarningDeductionType {
    HRMED_Id: number;
    HRMED_Name: string;
    HRMED_EDTypeFlag: string;
    HRMED_EarnDedFlag: string;
    HRMED_AmountPercentFlag: string;
}

// Leave Year Dropdown
export interface LeaveYearDropdown {
    HRMLY_Id: number;
    HRMLY_LeaveYear: string;
    HRMLY_FromDate: string;
    HRMLY_ToDate: string;
}

// Month Dropdown
export interface MonthDropdown {
    IVRM_Month_Id: number;
    IVRM_Month_Name: string;
}

// Grid Data Item
export interface SalaryIncrementGridItem {
    HREIC_Id: number;
    HRME_Id?: number;
    EmployeeName?: string;
    HRMD_DepartmentName?: string;
    HRMED_Name?: string;
    Amount: number;
    Flag?: string;
}

// Onload Response
export interface SalaryIncrementOnloadResponse {
    MI_Id: number;
    roleId: number;
    employeelist: EmployeeDropdown[];
    earningdeductiontype: EarningDeductionType[];
    leaveyeardropdown: LeaveYearDropdown[];
    monthdropdown: MonthDropdown[];
    griddata: SalaryIncrementGridItem[];
    retrunMsg?: string;
}

// Onload Request
export interface SalaryIncrementOnloadRequest {
    MI_Id: number;
    roleId: number;
}

// Save Request
export interface SalaryIncrementSaveRequest {
    HREIC_Id: number;
    MI_Id: number;
    HRME_Id: number;
    HREIC_IncrementDate: string;
    HREIC_ArrearApplicableFlg: boolean;
    HREIC_ArrearGivenFlg: boolean;
    HREIC_ArrearMonths: number;
    HRMED_Id: number;
    HREICED_Amount: number;
    HREICED_Percentage: string;
    HREIC_ActiveFlag: boolean;
    roleId: number;
    UserId: number;
}

// Save Response
export interface SalaryIncrementSaveResponse extends SalaryIncrementOnloadResponse {
    HREIC_Id?: number;
}

// Delete Request
export interface SalaryIncrementDeleteRequest {
    HREIC_Id: number;
    MI_Id: number;
    roleId: number;
}

// Delete Response
export interface SalaryIncrementDeleteResponse {
    retrunMsg?: string;
}
