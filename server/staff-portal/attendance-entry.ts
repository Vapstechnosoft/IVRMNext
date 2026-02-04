'use server';

import { api } from '@/lib/apiService';
import type {
    IAttendanceEntryInitialData,
    ISaveAttendanceRequest,
    IStudentDataResponse,
    IViewHistoryResponse
} from '@/types/staff-portal/attendance-entry';

/**
 * Load initial data for attendance entry
 */
export async function getInitialData(ASMAY_Id: number) {
    const url = `/StudentAttendanceEntry/get-staff-initial-data/${ASMAY_Id}`;
    return await api.get<IAttendanceEntryInitialData>('portal', url);
}

/**
 * Get student data based on class and year
 */
export async function getStudentData(data: any) {
    const url = '/StudentAttendanceEntry/get-staff-data/';
    return await api.post<IStudentDataResponse>('portal', url, data);
}

/**
 * Get month class held details
 */
export async function getMonthClassHeld(data: any) {
    const url = '/StudentAttendanceEntry/month-classheld/';
    return await api.post<IStudentDataResponse>('portal', url, data);
}

/**
 * Get date wise attendance
 */
export async function getDateWiseAttendance(data: any) {
    const url = '/StudentAttendanceEntry/datewise-data/';
    return await api.post<IStudentDataResponse>('portal', url, data);
}

/**
 * Get batch list for subject
 */
export async function getBatchList(data: any) {
    const url = '/StudentAttendanceEntry/batch-list/';
    return await api.post<IStudentDataResponse>('portal', url, data);
}

/**
 * Get student list for specific period
 */
export async function getStdListPeriod(data: any) {
    const url = '/StudentAttendanceEntry/staff-period-list/';
    return await api.post<IStudentDataResponse>('portal', url, data);
}

/**
 * Save or update student attendance
 */
export async function saveStudentAttendance(data: ISaveAttendanceRequest) {
    const url = '/StudentAttendanceEntry/save-staff-attendance/';
    return await api.post<{ message: string; returnval: boolean }>('portal', url, data);
}

/**
 * Delete attendance for current selection
 */
export async function deleteAttendance(data: any) {
    const url = '/StudentAttendanceEntry/delete-attendance';
    return await api.post<{ returnval: boolean }>('portal', url, data);
}

export async function viewAttendanceHistory(data: any) {
    const url = '/StudentAttendanceEntry/staffWise-attendance-details';
    return await api.post<IViewHistoryResponse>('portal', url, data);
}

export async function deleteRecordWise(data: any) {
    const url = '/StudentAttendanceEntry/rowwise-delete-attendance';
    return await api.post<IViewHistoryResponse & { returnval: boolean }>('portal', url, data);
}
