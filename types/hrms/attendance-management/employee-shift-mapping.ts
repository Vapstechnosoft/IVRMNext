// Employee Shift Mapping API Types

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    total?: number | null;
    page?: number | null;
    page_size?: number | null;
}

// Save Request - Exact structure as per API
export interface EmployeeShiftMappingSaveRequest {
    foesT_Id: number; // 0 for new, or existing ID for update
    mI_Id: number; // Module Institution ID (30)
    fomS_Id: number; // Shift Master ID (required - must be > 0)
    foesT_Date: string; // ISO date string (e.g., "2025-11-15T16:18:00.614Z")
    foesT_FDWHrMin: string; // Full Day Working Hours Minutes (empty string if not provided)
    foesT_HDWHrMin: string; // Half Day Working Hours Minutes (empty string if not provided)
    foesT_IHalfLoginTime: string; // First Half Login Time (empty string if not provided)
    foesT_IHalfLogoutTime: string; // First Half Logout Time (empty string if not provided)
    foesT_IIHalfLoginTime: string; // Second Half Login Time (empty string if not provided)
    foesT_IIHalfLogoutTime: string; // Second Half Logout Time (empty string if not provided)
    foesT_DelayPerShiftHrMin: string; // Delay Per Shift Hours Minutes (empty string if not provided)
    foesT_EarlyPerShiftHrMin: string; // Early Per Shift Hours Minutes (empty string if not provided)
    foesT_LunchHoursDuration: string; // Lunch Hours Duration (empty string if not provided)
    foesT_BlockAttendance: string; // Block Attendance (empty string if not provided)
    foesT_FixTimings: string; // Fix Timings (empty string if not provided)
    employeeIds: number[]; // Array of employee IDs (required - must not be empty)
    dayTypeIds: number[]; // Array of day type IDs (required - must not be empty)
    userId: number; // User ID (0 for now)
}

// Save Response
export interface EmployeeShiftMappingSaveResponse {
    success: boolean;
    message: string;
    data: any | null;
    total: number | null;
    page: number | null;
    page_size: number | null;
}

