'use server';

import { api } from '@/lib/apiService';
import type { IStaffDropdownList } from '@/types/timetable/masters/masters';

// Staff Wise TimeTable Report
export const getStaffWiseDetails = async (data: any) => {
    return await api.get<any>('timetable', 'StaffWiseTT/getdetails');
};

export const getStaffWiseReport = async (data: any) => {
    return await api.post<any>('timetable', 'StaffWiseTT/getrpt', data);
};

export const getStaffWiseReportUsingFacade = async (data: any) => {
    return await api.post<any>('timetable', 'StaffWiseTTFacade/StaffWiseTTreport', data);
};

export async function getstaffdropdowndatattstaffreport() {
    const url = '/TimeTableCommon/GetStaffDetails';
    return await api.get<IStaffDropdownList[]>('timetable', url);
}
