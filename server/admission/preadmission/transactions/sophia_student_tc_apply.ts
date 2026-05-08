'use server';

import { api } from '@/lib/apiService';

export async function getSophiaStudentTCApplyLoadData(data: { TCData: number }) {
    const url = '/StudentTC/TCloaddata/';
    return await api.post<any>('admission', url, data);
}

export async function getSophiaStudentTCApplyOnChangeClass(data: { ASMAY_Id: number; ASMCL_Id: number }) {
    const url = '/StudentTC/onchangeclass/';
    return await api.post<any>('admission', url, data);
}

export async function getSophiaStudentTCApplyStudentList(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
}) {
    const url = '/StudentTC/Studentlistdata/';
    return await api.post<any>('admission', url, data);
}

export async function saveSophiaStudentTCApply(data: {
    StudentTCdata: any[];
    transnumconfigsettings: any;
}) {
    const url = '/StudentTC/SavestudentTCdata/';
    return await api.post<any>('admission', url, data);
}

export async function getSophiaStudentTCTCPdf(data: { AMST_Id: number }) {
    const url = '/StudentTC/tcpdf';
    return await api.post<any>('admission', url, data);
}

export async function getSophiaStudentTCViewStatus(data: { AMST_Id: number }) {
    const url = '/StudentTC/viewstatus';
    return await api.post<any>('admission', url, data);
}
