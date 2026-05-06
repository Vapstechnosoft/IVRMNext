'use server';

import { api } from '@/lib/apiService';

export async function getSophiaMultiTCDetails() {
    const url = '/BBKVCustomReport/getdetails/2';
    return await api.get<any>('admission', url);
}

export async function getSophiaMultiTCOnChangeYear(data: { ASMAY_Id: number }) {
    const url = '/BBKVCustomReport/onchangeyear';
    return await api.post<any>('admission', url, data);
}

export async function getSophiaMultiTCOnChangeClass(data: { ASMAY_Id: number; ASMCL_Id: number }) {
    const url = '/BBKVCustomReport/onchangeclass';
    return await api.post<any>('admission', url, data);
}

export async function getSophiaMultiTCOnChangeSection(data: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number }) {
    const url = '/BBKVCustomReport/onchangesection';
    return await api.post<any>('admission', url, data);
}

export async function getSophiaMultiTCGetReport(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    Temp_AmstId: { AMST_Id: number }[];
}) {
    const url = '/BBKVCustomReport/GetReportdetails';
    return await api.post<any>('admission', url, data);
}
