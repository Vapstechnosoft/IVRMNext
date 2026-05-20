'use server';

import { api } from '@/lib/apiService';

export async function getAdmissionProcedureInitialDetails() {
    const url = '/AttendanceReport/getdetails/';
    return await api.get<any>('admission', url);
}

export async function getAdmissionProcedureClass(data: { ASMAY_Id: number; AMC_Id: number }) {
    const url = '/AttendanceReport/getclass';
    return await api.post<any>('admission', url, data);
}

export async function getAdmissionProcedureReport(data: {
    type: number;
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMC_Id: number;
}) {
    const url = '/AttendanceReport/GetReport';
    return await api.post<any>('admission', url, data);
}

export async function viewAdmissionDetails(data: {
    AMST_Id: number;
    ASMCL_Id: number;
    ASMAY_Id: number;
}) {
    const url = '/AttendanceReport/viewadmission';
    return await api.post<any>('admission', url, data);
}
