import { type ApiResponse } from '@/lib/apiService';

// Report Request
export interface SalaryIncrementReportRequest {
    HRME_Id: string;
    FROMDATE: string;
    TODATE: string;
    monthid: string;
    yearid: string;
    type: string;
    option: string;
}

// Report Data Item
export interface SalaryIncrementReportItem {
    hreiC_Id: number;
    hrmE_Id: number;
    employeeName: string;
    hrmeD_Name: string;
    hreiC_IncrementDate: string;
    hreiC_IncrementDueDate: string;
    hreiC_LastIncrementDate: string;
    hreiC_NextIncrementGivenDate: string;
    hreiceD_Amount: number;
    hreiceD_Percentage: string;
    hreiceD_PreviousAmount: number;
    hreeD_Amount: number;
    incrementamount: number;
}
