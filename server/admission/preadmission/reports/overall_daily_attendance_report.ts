'use server';

import { api } from '@/lib/apiService';

export async function getOverallDailyAttendanceReportInitialData() {
    const url = '/OverallDailyAttendanceReport/getdetails/';
    return await api.get<any>('admission', url);
}

export async function getOverallDailyAttendanceReportDetails(data: {
    ASMAY_Id: number;
    fromdate: string;
    AMC_Id: number;
}) {
    const url = '/OverallDailyAttendanceReport/getAttendetails';
    return await api.post<any>('admission', url, data);
}

export async function getOverallDailyAttendanceReportStudentDetails(data: {
    ASMCL_className: number;
    ASMC_SectionName: number;
    ASMAY_Id: number;
    fromdate: string;
}) {
    const url = '/OverallDailyAttendanceReport/getStudentDetails/';
    return await api.post<any>('admission', url, data);
}

export async function getOverallDailyAttendanceReportStudentAllDetails(data: {
    ASMAY_Id: number;
    fromdate: string;
}) {
    const url = '/OverallDailyAttendanceReport/getStudentAllDetails/';
    return await api.post<any>('admission', url, data);
}
