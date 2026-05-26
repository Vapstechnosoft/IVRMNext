'use server';

import { api } from '@/lib/apiService';
import type { IDeputationAcademicYear, IDeputationLoadData } from '@/types/timetable/TTreports';

export const getDeputationReportLoadData = async () => {
    const url = '/ClassWiseTTFacade/GetDeputaionStaffPeriodDetails';
    return await api.get<IDeputationLoadData>('timetable', url);
};

export const getDeputationReportDetails = async (data: any) => {
    const url = '/ClassWiseTTFacade/GetDeputaionReport';
    return await api.post<any>('timetable', url, data);
};

export async function getAcademicYear() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    return await api.get<IDeputationAcademicYear[]>('timetable', url);
}
