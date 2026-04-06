'use server';

import { api } from '@/lib/apiService';
import type {
    Staff,
    StaffReplacementInTheirTimeTableMasters,
    StaffReplacementReportResponse
} from '@/types/timetable/Transaction/staff-replacement-In-their-timeTable';

export async function getStaffReplacementExistingToNewMasters(): Promise<StaffReplacementInTheirTimeTableMasters> {
    try {
        const [staff] = await Promise.all([api.get<Staff[]>('timetable', '/TimeTableCommon/GetStaffDetails')]);

        return {
            staff: staff.data ?? (staff as unknown as Staff[])
        };
    } catch (error) {
        console.error('Error fetching staff replacement masters:', error);
        return { staff: [] };
    }
}

export async function getStaffReplacementReport(payload: { hrmE_Id: string }): Promise<StaffReplacementReportResponse> {
    const url = '/StaffReplacementInTheirTTFacade/TTStaffReplacementInTheirTTReport';
    const response = await api.post<StaffReplacementReportResponse>('timetable', url, payload);
    return (response.data ?? response) as unknown as StaffReplacementReportResponse;
}

/**
 * Saves staff replacement data
 */
export async function saveStaffReplacement(payload: any): Promise<{ returnval: boolean }> {
    try {
        const response = await api.post<any>('timetable', '/StaffReplacementInTheirTTFacade/savedetail', payload);
        return (response.data ?? response) as unknown as { returnval: boolean };
    } catch (error) {
        console.error('Error saving staff replacement:', error);
        return { returnval: false };
    }
}

/**
 * Fetches possible periods for replacement
 */
export async function getPossiblePeriods(payload: any): Promise<{ data_lst: any[] }> {
    try {
        const response = await api.post<any>('timetable', '/StaffReplacementInTheirTTFacade/getpossiblePeriod', payload);
        const data = response.data ?? response;
        console.log(data);

        let data_lst = data?.data_lst;
        if (data_lst?.$values) {
            data_lst = data_lst.$values;
        }

        return { data_lst: Array.isArray(data_lst) ? data_lst : [] };
    } catch (error) {
        console.error('Error fetching possible periods:', error);
        return { data_lst: [] };
    }
}
