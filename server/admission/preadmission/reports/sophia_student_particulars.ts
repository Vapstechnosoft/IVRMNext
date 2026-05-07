'use server';

import { api } from '@/lib/apiService';

export async function getSophiaStudentParticularsLoadData() {
    const url = '/DOBcertificate/getdata/1';
    return await api.get<any>('admission', url);
}

export async function getSophiaStudentParticularsStudentList(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
}) {
    const url = '/DOBcertificate/getstudbyclass';
    return await api.post<any>('admission', url, data);
}

export async function getSophiaStudentParticularsReport(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    giftedtalented: { admmT_Id: number }[];
    AMC_Id: number;
}) {
    const url = '/DOBcertificate/Studdetails';
    return await api.post<any>('admission', url, data);
}
