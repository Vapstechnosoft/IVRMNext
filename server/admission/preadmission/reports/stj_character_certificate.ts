'use server';

import { api } from '../../../../lib/apiService';

export async function getCharacterLoadData() {
    return await api.get<any>('admission', '/StudyCertificate/getdata');
}


export async function getCharacterSearchFilter(data: {
    filterinitialdata: string;
    searchfilter: string;
    ASMAY_Id: number;
    AMST_SOL: string;
    ASMCL_Id: number;
    ASMC_Id: number;
    allorindid: string;
}) {
    return await api.post<any>('admission', '/StudyCertificate/searchfilter', data);
}

export async function getCharacterStudDetails(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMST_Id: number;
}) {
    return await api.post<any>('admission', '/StudyCertificate/Studdetails', data);
}
