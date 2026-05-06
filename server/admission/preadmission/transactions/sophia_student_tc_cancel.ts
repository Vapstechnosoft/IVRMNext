'use server';

import { api } from '@/lib/apiService';

export async function getSophiaStudentTCCancelLoadData() {
    // Legacy code uses 2 as pageid or similar
    const url = '/StudentTC/GetTCCancelDetails/2';
    return await api.get<any>('admission', url);
}

export async function getSophiaStudentTCCancelOnChangeYear(asmayId: number) {
    const url = '/StudentTC/OnChangeAcademicYear';
    return await api.post<any>('admission', url, { ASMAY_Id: asmayId });
}

export async function getSophiaStudentTCCancelOnStudentChange(asmayId: number, amstId: number) {
    const url = '/StudentTC/OnStudentNameChange';
    return await api.post<any>('admission', url, { ASMAY_Id: asmayId, AMST_Id: amstId });
}

export async function saveSophiaStudentTCCancelDetails(data: { AMST_Id: number; ASMAY_Id: number; TC_CancelReason: string }) {
    const url = '/StudentTC/SaveTCCancelDetails';
    return await api.post<any>('admission', url, data);
}
