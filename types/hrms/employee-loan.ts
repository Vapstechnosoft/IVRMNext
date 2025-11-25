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
    MI_Id: number;
    HRML_LoanType: string;
    HRML_Max: number;
    HRMLN_ActiveFlag: boolean;
    CreatedDate?: string;
    UpdatedDate?: string;
}

// Mode of Payment Dropdown
export interface ModeOfPaymentDropdown {
    IVRMMOD_Id: number;
    MI_Id: number;
    IVRMMOD_ModeOfPayment: string;
    IVRMMOD_ActiveFlag: boolean;
    IVRMMOD_Flag: string;
    IVRMMOD_ModeOfPayment_Code: string;
    IVRMMOD_CreatedBy: number;
    IVRMMOD_UpdatedBy: number;
    CreatedDate?: string;
    UpdatedDate?: string;
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

// Configuration Details (shared with salary advance)
export interface ConfigurationDetails {
    HRC_Id: number;
    MI_Id: number;
    HRC_PFMaxAmt: number;
    HRC_FPFPer: number;
    HRC_EPFPer: number;
    HRC_AsPerEmpFlag: boolean;
    HRC_PFAccNoPrefix: string;
    HRC_AccNo2: number;
    HRC_AccNo21: number;
    HRC_AccNo22: number;
    HRC_RetirementYrs: number;
    HRC_ECodePrefix: string;
    HRC_ESIMax: number;
    HRC_ESIEmplrCont: number;
    HRC_PayMethodFlg: string;
    HRC_ArrSalaryFlag: boolean;
    HRC_CummArrFlag: boolean;
    HRC_SalaryFromDay: number;
    HRC_SalaryToDay: number;
    HRC_ARTFPFPer: number;
    HRC_ARTEPFPer: number;
    HRC_ESIMaxAmount: number;
    HRC_AC2MinAmount: number;
    HRC_AC21MinAmount: number;
    HRC_AC22MinAmount: number;
    HRC_SalAdvApprovalFlg: boolean;
    HRC_LoanApprovalFlg: boolean;
    HRC_LeaveApprovalFlg: boolean;
    HRC_IncrementApprovalFlg: boolean;
    HRC_ProbationApprovalFlg: boolean;
    HRC_SalApprovalFlg: boolean;
    HRC_EducationCess: number;
    roleId: number | null;
    retrunMsg: string | null;
    hrStandardList: any[] | null;
    monthdropdown: any[] | null;
    HRC_partAmaxflag: number;
    HRC_partBmaxflag: number;
    HRC_IncrementMonth: string;
    HRC_MinimumWorkingPeriod: number;
    HRC_FixedIncrmentFlg: boolean;
    HRC_NoOfOptionalHolidays: number;
    HRC_IncrementOnceInMonths: number;
    HRC_AlertDay: number;
}

// Onload Response
export interface EmployeeLoanOnloadResponse {
    HREL_Id: number;
    MI_Id: number;
    HRME_Id: number;
    HREL_AppliedDate: string | null;
    HREL_EmpLoanId: string | null;
    HRMLN_Id: number;
    HREL_LoanAmount: number | null;
    HREL_LoanInsallments: number | null;
    HREL_LaonEMI: number | null;
    HREL_LoanStatus: string | null;
    HREL_SanctionedAmount: number | null;
    HREL_TotalPrincipalPaid: number | null;
    HREL_TotalInterestPaid: number | null;
    HREL_TotalPending: number | null;
    HREL_LoanInterest: number | null;
    HREL_ModeOfPayment: string | null;
    HREL_ReferenceNo: number | null;
    HREL_ActiveFlag: boolean;
    emploanList: EmployeeLoanItem[] | null;
    retrunMsg: string;
    roleId: number;
    employeedropdown: EmployeeDropdown[];
    masterloandropdown: MasterLoanDropdown[];
    hrmE_EmployeeFirstName: string | null;
    HRML_LoanType: string | null;
    modeOfPaymentdropdown: ModeOfPaymentDropdown[];
    configurationDetails: ConfigurationDetails | null;
    transnumconfigsettings: any | null;
    ASMAY_Id: number;
    empGrossSal: number | null;
    HREL_NoofInstallment: number;
    CreatedDate: string | null;
    UpdatedDate: string | null;
}

// Onload Request
export interface EmployeeLoanOnloadRequest {
    page?: number;
    page_size?: number;
    search_query?: string;
    search_column?: string;
    sort_column?: string;
    sort_direction?: string;
    is_export?: boolean;
    MIID?: number;
    LoginUserId?: number;
    UserRole?: string;
    roleId?: number; // Keep for backward compatibility
}

// Save Request
export interface EmployeeLoanSaveRequest {
    HREL_Id: number;
    MI_Id: number;
    HRME_Id: number;
    HREL_AppliedDate: string;
    HREL_EmpLoanId?: string;
    HRMLN_Id: number;
    HREL_LoanAmount: number;
    HREL_LoanInsallments: number | string;
    HREL_LaonEMI: number | string;
    HREL_LoanInterest: number;
    HREL_ModeOfPayment: string;
    HREL_ReferenceNo: string | number;
    ASMAY_Id?: number;
    // Optional fields for backward compatibility
    HREL_LoanStatus?: string;
    HREL_SanctionedAmount?: number;
    HREL_TotalPrincipalPaid?: number;
    HREL_TotalInterestPaid?: number;
    HREL_TotalPending?: number;
    HREL_ActiveFlag?: boolean;
    HREL_NoofInstallment?: number;
    roleId?: number;
}

// Save Response
export interface EmployeeLoanSaveResponse extends Omit<EmployeeLoanOnloadResponse, 'HREL_Id'> {
    HREL_Id?: number;
}

// Delete/Deactivate Request
export interface EmployeeLoanDeleteRequest {
    HREL_Id: number;
    MI_Id?: number;
    // Optional fields for backward compatibility
    HREL_ActiveFlag?: boolean;
    roleId?: number;
}
