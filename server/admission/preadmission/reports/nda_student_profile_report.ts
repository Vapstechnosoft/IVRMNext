'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches initial data for NDA Student Profile Status Report (Years, Classes, etc.)
 */
export async function getNdaStudentProfileInitialData() {
    const url = '/Smartcarddetails/getdetails/';
    const res = await api.get<any>('admission', url);
    return res?.data || res;
}

/**
 * Fetches student or staff profile status details
 */
export async function getNdaStudentProfileReport(data: {
    dup: 'Student' | 'Staff';
    ASMAY_Id?: number;
    ASMCL_Id?: number;
    ASMS_Id?: number;
}) {
    const url = '/SMSApprovalTransaction/NDAStudentprofiledetails';
    const res = await api.post<any>('admission', url, data);
    return res?.data || res;
}
