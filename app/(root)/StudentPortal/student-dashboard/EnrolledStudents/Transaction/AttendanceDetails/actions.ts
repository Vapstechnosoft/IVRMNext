'use server';

import { api } from '@/lib/apiService';

export interface AttendanceLoadData {
    attyearlist: {
        asmaY_Id: number;
        asmaY_Year: string;
    }[];
    currentyear: {
        asmaY_Id: number;
    }[];
}

export interface AttendanceData {
    attList: {
        CLASS_HELD: number;
        TOTAL_PRESENT: number;
        ABSENT_COUNT: number;
        score: number;
        ABSENT_DATES: string;
        MONTH_NAME: string;
    }[];
}

export async function getAttendanceLoadData(data: any) {
    // Assumption: The backend API path follows the pattern /api/[Controller]/[Action]
    // or /api/StudentPortal/[Controller]/[Action]
    // Based on legacy code: "AttendanceDetails/getloaddata"
    const url = '/api/AttendanceDetails/getloaddata';
    return await api.post<any>('default', url, data);
}

export async function getAttendanceData(data: { ASMAY_Id: number }) {
    const url = '/api/AttendanceDetails/getAttdata';
    return await api.post<any>('default', url, data);
}
