// Salary Updation Types

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

// Salary Updation Item
export interface SalaryUpdationItem {
    HRESU_Id: number;
    MI_Id: number;
    HRME_Id: number;
    HRME_EmployeeCode?: string;
    HRME_EmployeeFirstName?: string;
    HRME_EmployeeMiddleName?: string;
    HRME_EmployeeLastName?: string;
    HRESU_OldSalary: number;
    HRESU_NewSalary: number;
    HRESU_EffectiveDate: string;
    HRESU_Remarks?: string;
    HRESU_ActiveFlag: boolean;
    CreatedDate?: string;
    UpdatedDate?: string;
}

// Employee Dropdown
export interface EmployeeDropdown {
    HRME_Id: number;
    HRME_EmployeeCode: string;
    HRME_EmployeeFirstName: string;
    HRME_EmployeeMiddleName?: string;
    HRME_EmployeeLastName?: string;
}

// Onload Response
export interface SalaryUpdationOnloadResponse {
    MI_Id: number;
    roleId: number;
    salaryUpdationList: SalaryUpdationItem[];
    employeedropdown: EmployeeDropdown[];
    retrunMsg?: string;
}

// Onload Request
export interface SalaryUpdationOnloadRequest {
    roleId: number;
}

// Save Request
export interface SalaryUpdationSaveRequest {
    HRESU_Id: number;
    MI_Id: number;
    HRME_Id: number;
    HRESU_OldSalary: number;
    HRESU_NewSalary: number;
    HRESU_EffectiveDate: string;
    HRESU_Remarks?: string;
    HRESU_ActiveFlag: boolean;
    roleId: number;
}

// Save Response
export interface SalaryUpdationSaveResponse extends SalaryUpdationOnloadResponse {
    HRESU_Id?: number;
}

// Delete Request
export interface SalaryUpdationDeleteRequest {
    HRESU_Id: number;
    roleId: number;
}
