'use server';

import { api } from '@/lib/apiService';

export async function getCbsStudyCertLoadData(pageId: number) {
    return await api.post<any>('admission', `/StudyCertificate/getdata`, pageId);
}

export async function getCbsStudyCertSearchFilter(data: {
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

export async function getCbsStudyCertDetails(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMST_Id: number;
    ASCISS_CertificateFlg: string;
}) {
    return await api.post<any>('admission', '/StudyCertificate/StuddetailsReport', data);
}

export async function getCbsCharacterCertDetails(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMST_Id: number;
}) {
    return await api.post<any>('admission', '/StudyCertificate/Studdetails', data);
}

export async function saveCbsStudyCertQRCode(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMST_Id: number;
    CertificateDate: Date;
    ASCISS_HtmlTemplate: string;
    ASCISS_CertificateFlg: string;
    ASCISS_QRCode: string;
}) {
    return await api.post<any>('admission', '/QRcodeStudentCertificate/QRCODECertificates', data);
}
