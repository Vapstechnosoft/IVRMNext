// Employee Shift Mapping API Types

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    total?: number | null;
    page?: number | null;
    page_size?: number | null;
}

// Save Request - Exact structure as per API (uppercase field names)
export interface EmployeeShiftMappingSaveRequest {
    FOEST_Id: number; // 0 for new, or existing ID for update
    MI_Id: number; // Module Institution ID (30)
    FOMS_Id: number; // Shift Master ID (required - must be > 0)
    FOEST_Date: string; // ISO date string (e.g., "2025-11-23T12:37:28.979Z")
    FOEST_FDWHrMin: string; // Full Day Working Hours Minutes (empty string if not provided)
    FOEST_HDWHrMin: string; // Half Day Working Hours Minutes (empty string if not provided)
    FOEST_IHalfLoginTime: string; // First Half Login Time (empty string if not provided)
    FOEST_IHalfLogoutTime: string; // First Half Logout Time (empty string if not provided)
    FOEST_IIHalfLoginTime: string; // Second Half Login Time (empty string if not provided)
    FOEST_IIHalfLogoutTime: string; // Second Half Logout Time (empty string if not provided)
    FOEST_DelayPerShiftHrMin: string; // Delay Per Shift Hours Minutes (empty string if not provided)
    FOEST_EarlyPerShiftHrMin: string; // Early Per Shift Hours Minutes (empty string if not provided)
    FOEST_LunchHoursDuration: string; // Lunch Hours Duration (empty string if not provided)
    FOEST_BlockAttendance: string; // Block Attendance (empty string if not provided)
    FOEST_FixTimings: string; // Fix Timings (empty string if not provided)
    EmployeeIds: number[]; // Array of employee IDs (required - must not be empty)
    DayTypeIds: number[]; // Array of day type IDs (required - must not be empty)
    UserId: number; // User ID (0 for now)
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

