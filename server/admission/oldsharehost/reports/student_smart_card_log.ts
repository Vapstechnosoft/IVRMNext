'use server';

import { api } from '@/lib/apiService';

export async function getStudentSmartCardLogInitialDetails() {
    const url = `/StudentSmartCardLogReports/getalldetails/1`;
    return await api.get<any>('admission', url);
}

export async function getStudentSmartCardLogNameRegNo(data: any) {
    const url = `/StudentSmartCardLogReports/getnameregno`;
    return await api.post<any>('admission', url, data);
}

export async function getStudentSmartCardLogReport(data: any) {
    const url = `/StudentSmartCardLogReports/Getreportdetails`;
    return await api.post<any>('admission', url, data);
}
