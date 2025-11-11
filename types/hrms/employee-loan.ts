// Employee Loan Types - Simplified for IVRMNext

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T | null;
}

// Simplified Employee Dropdown
export interface EmployeeDropdown {
    HRME_Id: number;
    HRME_EmployeeCode: string;
    HRME_EmployeeFirstName: string;
    HRME_EmployeeMiddleName?: string | null;
    HRME_EmployeeLastName?: string | null;
}

// Master Loan Dropdown
export interface MasterLoanDropdown {
    HRMLN_Id: number;
    HRML_LoanType: string;
    HRML_Max: number;
    HRMLN_ActiveFlag: boolean;
}

// Mode of Payment Dropdown
export interface ModeOfPaymentDropdown {
    IVRMMOD_Id: number;
    IVRMMOD_ModeOfPayment: string;
}

// Employee Loan Item (for table display)
export interface EmployeeLoanItem {
    HREL_Id: number;
    MI_Id: number;
    HRME_Id: number;
    HRME_EmployeeCode?: string;
    HRME_EmployeeFirstName?: string;
    HRME_EmployeeMiddleName?: string | null;
    HRME_EmployeeLastName?: string | null;
    HRMLN_Id: number;
    HRML_LoanType?: string;
    HREL_AppliedDate: string;
    HREL_LoanAmount: number;
    HREL_LoanInsallments: number;
    HREL_LaonEMI: number;
    HREL_LoanStatus: string;
    HREL_SanctionedAmount: number;
    HREL_TotalPrincipalPaid: number;
    HREL_TotalInterestPaid: number;
    HREL_TotalPending: number;
    HREL_LoanInterest: number;
    HREL_ModeOfPayment?: string;
    HREL_ReferenceNo?: string;
    HREL_ActiveFlag: boolean;
    HREL_NoofInstallment?: number;
    CreatedDate?: string;
    UpdatedDate?: string;
}

// Onload Response
export interface EmployeeLoanOnloadResponse {
    MI_Id: number;
    roleId: number;
    emploanList: EmployeeLoanItem[];
    employeedropdown: EmployeeDropdown[];
    masterloandropdown: MasterLoanDropdown[];
    modeOfPaymentdropdown: ModeOfPaymentDropdown[];
    retrunMsg?: string;
}

// Onload Request
export interface EmployeeLoanOnloadRequest {
    roleId: number;
}

// Save Request
export interface EmployeeLoanSaveRequest {
    HREL_Id: number;
    MI_Id: number;
    HRME_Id: number;
    HRMLN_Id: number;
    HREL_AppliedDate: string;
    HREL_LoanAmount: number;
    HREL_LoanInsallments: number;
    HREL_LaonEMI: number;
    HREL_LoanStatus: string;
    HREL_SanctionedAmount: number;
    HREL_TotalPrincipalPaid: number;
    HREL_TotalInterestPaid: number;
    HREL_TotalPending: number;
    HREL_LoanInterest: number;
    HREL_ModeOfPayment: string;
    HREL_ReferenceNo: string;
    HREL_ActiveFlag: boolean;
    HREL_NoofInstallment: number;
    roleId: number;
}

// Save Response
export interface EmployeeLoanSaveResponse extends EmployeeLoanOnloadResponse {
    HREL_Id?: number;
}

// Delete Request
export interface EmployeeLoanDeleteRequest {
    HREL_Id: number;
    HREL_ActiveFlag: boolean;
    roleId: number;
}
