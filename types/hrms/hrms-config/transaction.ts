// Salary Approval Types

// Employee Detail
export interface EmployeeDetail {
    HRME_Id: number;
    HRME_EmployeeCode: string;
    HRME_EmployeeFirstName: string;
    HRME_EmployeeMiddleName: string | null;
    HRME_EmployeeLastName: string | null;
    HRMGT_EmployeeGroupType: string;
    HRMD_DepartmentName: string;
    HRMDES_DesignationName: string;
    // Working Days and LOP
    HRES_WorkingDays: number;
    HRES_LOPDays?: number;
    // Gross Salary
    GrossSalary?: number;
    // Earnings
    DA?: number;
    HRA?: number;
    Conveyance?: number;
    Medical?: number;
    SplAllowance?: number;
    TotalEarning: number;
    // Deductions
    PF?: number;
    ESI?: number;
    OthersCD?: number;
    PT?: number;
    TotalDeduction: number;
    // Net Salary
    NetSalary: number;
    HRES_Year: string;
    HRES_Month: string;
    [key: string]: any;
}

