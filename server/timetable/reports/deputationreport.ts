'use server';

import { api } from '@/lib/apiService';
import type { IDeputationAcademicYear } from '@/types/timetable/TTreports';

export const getDeputationReportLoadData = async () => {
    return await api.get<any>('timetable', 'Deputation/getdetails');
};

export const getDeputationReportDetails = async (data: any) => {
    return await api.post<any>('timetable', 'Deputation/getreport', data);
};

export async function getAcademicYear() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    return await api.get<IDeputationAcademicYear[]>('timetable', url);
}