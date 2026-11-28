'use server';

import { type ApiResponse, api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { IEmployeeDailyTimetableResponse, IEmployeeTimetableResponse } from '@/types/staff-portal/timetable';

/**
 * Fetch employee full timetable details (weekly view, periods, days, allocations)
 */
export async function getEmployeeTimetableDetails(): Promise<ApiResponse<IEmployeeTimetableResponse>> {
    const session = await auth();
    const payload = {
        MI_Id: session?.mi_id,
        UserId: session?.user_id || session?.userId,
        ASMAY_Id: session?.asmay_id
    };

    // 1. Try IVRMUX controller on default base URL
    try {
        const res = await api.get<IEmployeeTimetableResponse>('default', '/Employee_Timetable/getalldetails');
        if (res?.success && res.data) {
            return res;
        }
    } catch {
        // Fallback to POST
    }

    // 2. Try POST on default base URL with session payload
    try {
        const res = await api.post<IEmployeeTimetableResponse>('default', '/Employee_Timetable/getalldetails', payload);
        if (res?.success && res.data) {
            return res;
        }
    } catch {
        // Fallback to portal microservice
    }

    // 3. Try Portal microservice
    try {
        const res = await api.post<IEmployeeTimetableResponse>('portal', '/EmployeeTTFacade/getdata', payload);
        if (res?.success && res.data) {
            return res;
        }
    } catch (err: any) {
        console.error('Error fetching employee timetable details:', err?.message || err);
    }

    return {
        success: false,
        message: 'Failed to fetch timetable details',
        data: null
    };
}

/**
 * Fetch daily timetable details for a selected day (TTMD_Id)
 */
export async function getEmployeeDailyTimetable(ttmd_id: number): Promise<ApiResponse<IEmployeeDailyTimetableResponse>> {
    const session = await auth();
    const payload = {
        TTMD_Id: ttmd_id,
        MI_Id: session?.mi_id,
        UserId: session?.user_id || session?.userId,
        ASMAY_Id: session?.asmay_id
    };

    // 1. Try IVRMUX controller with URI parameter
    try {
        const res = await api.get<IEmployeeDailyTimetableResponse>('default', `/Employee_Timetable/getdaily_data/${ttmd_id}`);
        if (res?.success && res.data) {
            return res;
        }
    } catch {
        // Fallback to portal
    }

    // 2. Try Portal microservice
    try {
        const res = await api.post<IEmployeeDailyTimetableResponse>('portal', '/EmployeeTTFacade/getdaily_data', payload);
        if (res?.success && res.data) {
            return res;
        }
    } catch {
        // Fallback to POST on default
    }

    // 3. Try POST on default
    try {
        const res = await api.post<IEmployeeDailyTimetableResponse>('default', `/Employee_Timetable/getdaily_data/${ttmd_id}`, payload);
        if (res?.success && res.data) {
            return res;
        }
    } catch (err: any) {
        console.error('Error fetching employee daily timetable:', err?.message || err);
    }

    return {
        success: false,
        message: 'Failed to fetch daily timetable data',
        data: null
    };
}
