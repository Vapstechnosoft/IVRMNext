
export interface LeaveOpeningBalanceEntry {
    hreobL_Id: number;
    hrmE_Id: number;
    hrmL_LeaveName: string;
    hrmE_EmployeeName: string;
    hreobL_OBLeaves: number;
    hrmL_Id: number;
    hrmE_EmployeeCode?: string; // It was in the mock data, might be useful
}

export interface SaveLeaveOpeningBalancePayload {
    hrmE_Id: number;
    employeeLeaveOB: {
        hrmL_Id: number;
        hreobL_OBLeaves: number;
    }[];
}

export interface LeaveOpeningBalanceSearch {
    hrmE_Id?: number;
    hrmL_Id?: number;
}
