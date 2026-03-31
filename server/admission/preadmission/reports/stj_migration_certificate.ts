'use server';

import { api } from '../../../../lib/apiService';

export async function getMigrationLoadData() {
    return await api.get<any>('admission', '/HHSBonafiedCertificate/getdata');
}

export async function getMigrationStudentStatusChange(data: {
    AMST_SOL: string;
}) {
    return await api.post<any>('admission', '/HHSBonafiedCertificate/getS/', data);
}

export async function getMigrationAcademicYearChange(data: {
    ASMAY_Id: number;
    AMST_SOL: string;
}) {
    return await api.post<any>('admission', '/HHSBonafiedCertificate/onacademicyearchange/', data);
}

export async function getMigrationSearchFilter(data: {
    filterinitialdata: string;
    searchfilter: string;
    ASMAY_Id: number;
    AMST_SOL: string;
    ASMCL_Id: number;
    ASMC_Id: number;
    allorindid: string;
}) {
    return await api.post<any>('admission', '/HHSBonafiedCertificate/searchfilter', data);
}

export async function getMigrationStudDetails(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMST_Id: number;
    save_flag: string;
}) {
    return await api.post<any>('admission', '/HHSBonafiedCertificate/MigrationCertificateStuddetails', data);
}
