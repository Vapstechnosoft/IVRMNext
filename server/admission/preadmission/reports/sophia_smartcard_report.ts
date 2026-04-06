'use server';

import { api } from '@/lib/apiService';

export async function getSmartcardLoadData() {
    return await api.get<any>('admission', '/Smartcarddetails/getdetails/');
}

export async function getSmartcardReportData(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    stdmobilenumber: string; // Used for Regular/New radio
}) {
    return await api.post<any>('admission', '/Smartcarddetails/getAttendetails', data);
}
