'use server';

import { api } from '@/lib/apiService';
import { ISectionDropdown, IStaffDropdownListStaffWiseTTReport } from '@/types/timetable/reports';

// Class Wise TimeTable Report
export const getClassWiseReportDetails = async (data: any) => {
    return await api.get<any>('timetable', 'ClassWiseTT/getdetails');
};

export const getClassWiseReport = async (data: any) => {
    return await api.post<any>('timetable', 'ClassWiseTT/getrpt', data);
};

export const getClassByCategory = async (data: any) => {
    return await api.post<any>('timetable', 'ClassWiseTT/getclass_catg', data);
};


export async function getSectionDetailsTT() {
    console.log("Fetching section details for TT");
    const url = '/TimeTableCommon/section-details';
    return await api.get<ISectionDropdown[]>('timetable', url);
}