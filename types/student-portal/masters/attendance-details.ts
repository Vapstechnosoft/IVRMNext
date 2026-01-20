// Response for Academic Year Dropdown
export interface IAttendanceYear {
    amsT_Id: number;
    asmaY_Id: number;
    asmaY_Year: string;
    asmaY_Order: number;
}

// Response for Attendance List
export interface IAttendanceData {
    month_name: string;
    total_present: number;
    class_held: number;
    score: number;
    absent_count: number;
    absent_dates: string;
}

export interface IAttendanceGraphData {
    label: string;
    y: number;
}

// Generic API Response Wrapper (matching the user's sample)
export interface IApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    total: number | null;
    page: number | null;
    page_size: number | null;
}
