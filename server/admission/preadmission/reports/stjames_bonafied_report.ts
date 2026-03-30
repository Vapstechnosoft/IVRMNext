'use server';

import { api } from '../../../../lib/apiService';

export async function getBonafiedLoadData() {
    return await api.get<any>('admission', '/HHSBonafiedCertificate/sjgetdata');
}

export async function getBonafiedStudentStatusChange(data: {
    amsT_SOL: string;
}) {
    return await api.post<any>('admission', '/HHSBonafiedCertificate/sjgetS', data);
}

export async function getBonafiedAcademicYearChange(data: {
    asmaY_Id: number;
    amsT_SOL: string;
}) {
    return await api.post<any>('admission', '/HHSBonafiedCertificate/sjonacademicyearchange', data);
}

export async function getBonafiedSearchFilter(data: {
    filterinitialdata: string;
    searchfilter: string;
    ASMAY_Id: number;
    AMST_SOL: string;
    ASMCL_Id: number;
    ASMC_Id: number;
    allorindid: string;
    fillstudlist?: string[];
}) {
    return await api.post<any>('admission', '/HHSBonafiedCertificate/sjsearchfilter', data);
}

export async function getBonafiedStudDetails(data: {
    asmaY_Id: number;
    asmcL_Id: number;
    asmC_Id: number;
    amsT_Id: number;
    save_flag: string;
}) {
    return await api.post<any>('admission', '/HHSBonafiedCertificate/sjStuddetails', data);
}
