'use server';

import { api } from '@/lib/apiService';

export async function getSophiaStudentTCApprovalLoadData(data: { dup: string }) {
    const url = '/SMSApprovalTransaction/Getdata';
    return await api.post<any>('admission', url, data);
}

export async function getSophiaStudentTCApprovalDetails(data: { ASMAY_Id: number }) {
    const url = '/SMSApprovalTransaction/gettcdetails';
    return await api.post<any>('admission', url, data);
}

export async function saveSophiaStudentTCApprovalData(data: { SelectedTCDATAlist: any[] }) {
    const url = '/SMSApprovalTransaction/saveTCdata';
    return await api.post<any>('admission', url, data);
}

export async function updateSophiaStudentTCApprovalIDs(data: { STUDENTDATA: any[] }) {
    const url = '/SMSApprovalTransaction/onchangeID';
    return await api.post<any>('admission', url, data);
}
