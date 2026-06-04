'use server';

import { api } from '@/lib/apiService';



export async function getTTMonthEndReportDetails() {
    const url = '/TimeTableCommon/GetClassData';
    console.info('MasterDayFacade', url);
    return await api.get<any[]>('timetable', url);
}

export async function getTTMonthEndReport(data: { month: number; ASMAY_ID: number }) {
    const url = '/TTMonthEndReport/getreport';
    console.info('MasterDayFacade', url);
    return await api.post<any[]>('timetable', url, data);
}
