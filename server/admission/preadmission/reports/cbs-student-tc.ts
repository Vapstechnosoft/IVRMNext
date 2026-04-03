'use server';

import { api } from '@/lib/apiService';

export async function getCbsTcInitialData() {
    const url = '/StudenttcCustomReport/getdetails/2';
    return await api.get<any>('admission', url);
}

export async function changeCbsTcYear(data: {
    ASMAY_Id: number;
    tctemporper: string;
    report_type: string;
}) {
    const url = '/StudenttcCustomReport/changeyear';
    return await api.post<any>('admission', url, data);
}

export async function changeCbsTcClass(data: {
    ASMAY_Id: number;
    tctemporper: string;
    report_type: string;
    ASMCL_Id: number;
}) {
    const url = '/StudenttcCustomReport/changeclass';
    return await api.post<any>('admission', url, data);
}

export async function changeCbsTcSection(data: {
    ASMAY_Id: number;
    tctemporper: string;
    report_type: string;
    ASMCL_Id: number;
    ASMS_Id: number;
}) {
    const url = '/StudenttcCustomReport/changesection';
    return await api.post<any>('admission', url, data);
}

export async function getCbsTcDetails(data: {
    ASMAY_Id: number;
    AMST_Id: number;
    tctemporper: string;
    ASMCL_Id?: number;
    ASMS_Id?: number;
}) {
    // Legacy use getTcdetails for the certificate data
    const url = '/StudenttcCustomReport/getTcdetails';
    return await api.post<any>('admission', url, data);
}

export async function saveCbsTcCertificates(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMST_Id: number;
    ASCISS_HtmlTemplate: string;
    ASCISS_CertificateFlg: string;
    ASCISS_QRCode: string;
}) {
    // Matches the legacy controller's QR Code saving endpoint
    const url = '/QRcodeStudentCertificate/QRCODECertificates';
    return await api.post<any>('admission', url, data);
}

