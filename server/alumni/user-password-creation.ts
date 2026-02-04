'use server';

import { api } from '@/lib/apiService';
import type { IUserPasswordCreationInitialData, IUserPasswordCreationReportResponse } from '@/types/alumni/user-password-creation';

export async function getInitialData() {
    const url = '/UsrPwd/getdata';
    return await api.get<IUserPasswordCreationInitialData>('alumni', url);
}

export async function getReportDetails(data: {
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    filterdata: string;
}) {
    try {
        const url = `UsrPwd/Getreportdetails?ASMAY_Id=${data.asmaY_Id}&ASMCL_Id=${data.asmcL_Id}&ASMS_Id=${data.asmS_Id}&filterdata=${data.filterdata}`;
        const res = await api.get<IUserPasswordCreationReportResponse>('alumni', url);
        return { success: true, data: res.data?.messagelist };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function createUsername(data: any) {
    const url = '/UsrPwd/createusrnme';
    return await api.post<any>('alumni', url, data);
}

export async function sendEmail(data: any) {
    const url = '/SMSEmailSend/emailsend';
    return await api.post<any>('alumni', url, data);
}
