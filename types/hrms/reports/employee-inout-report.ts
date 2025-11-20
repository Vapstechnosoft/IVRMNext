// Employee In-Out Report API Types

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

// Group Type (from types array in response)
export interface EmployeeInOutGroupType {
    hrmgT_Id: number;
    mI_Id: number;
    hrmgT_EmployeeGroupType: string;
    hrmgT_Code: string;
    hrmgT_Order: number;
    hrmgT_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

// Onload Request
export interface EmployeeInOutReportOnloadRequest {
    page: number;
    page_size: number;
    search_query: string;
    search_column: string;
    sort_column: string;
    sort_direction: string;
    is_export: boolean;
    miid: number;
    loginUserId: number;
    userRole: string;
}

// Onload Response
export interface EmployeeInOutReportOnloadResponse {
    types: EmployeeInOutGroupType[];
    lieo: any | null;
    lateInApproval: any | null;
}

// Full API Response
export interface EmployeeInOutReportGetDataResponse {
    success: boolean;
    message: string;
    data: EmployeeInOutReportOnloadResponse;
    total: number;
    page: number;
    page_size: number;
}

