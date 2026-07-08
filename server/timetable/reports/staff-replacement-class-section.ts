'use server';

import { api } from '@/lib/apiService';

// Staff Replacement For Class And Section Report
export async function getStaffReplacementClassSectionReport(data: any) {
    const url = '/StaffReplacementForClassSectionFacade/getClassSectionreport';
    return await api.post<any>('timetable', url, data);
}
