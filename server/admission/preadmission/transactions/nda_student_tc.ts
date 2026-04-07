'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches initial data (Academic Years, Classes, etc.) for NDA Student TC
 */
export async function getNdaStudentTcLoadData(asmayId?: number) {
    const data = { "TCData": 1 };
    let url = '/StudentTc/NDATCloaddata';
    if (asmayId) {
        url += `?ASMAY_Id=${asmayId}`;
    }
    return await api.post<any>('admission', url, data);
}

/**
 * Fetches section list based on academic year and class
 */
export async function getNdaStudentTcSections(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
}) {
    const url = `/StudentTc/NDAonchangeclass?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}`;
    return await api.post<any>('admission', url, data);
}

/**
 * Searches for student list for TC application
 */
export async function getNdaStudentTcSearchList(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
}) {
    const url = `/StudentTc/NDAStudentlistdata?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}`;
    return await api.post<any>('admission', url, data);
}

/**
 * Saves student TC applications
 */
export async function saveNdaStudentTcData(data: {
    studentTCdata: any[];
    transnumconfigsettings: any;
    tcflagexists: string;
}) {
    const url = '/StudentTc/NDASavestudentTCdata';
    return await api.post<any>('admission', url, data);
}

/**
 * Fetches TC PDF data for viewing
 */
export async function getNdaStudentTcPdfData(data: {
    AMST_Id: number;
}) {
    const url = `/StudentTc/tcpdf?AMST_Id=${data.AMST_Id}`;
    return await api.post<any>('admission', url, data);
}

/**
 * Fetches approval status view details
 */
export async function getNdaStudentTcApprovalStatus(data: {
    AMST_Id: number;
}) {
    const url = `/StudentTc/viewstatus?AMST_Id=${data.AMST_Id}`;
    return await api.post<any>('admission', url, data);
}
