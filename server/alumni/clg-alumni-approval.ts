'use server';

import { api } from '@/lib/apiService';
import type {
    IApproveClgAlumniResponse,
    ICheckStudentAlumniResponse,
    IClgAlumniApprovalLoadDataResponse
} from '@/types/alumni/clg-alumni-approval';

export async function getClgAlumniApprovalLoadData() {
    const url = '/CLGAlumniMembership/get_intial_data/1';
    return await api.get<IClgAlumniApprovalLoadDataResponse>('alumni', url);
}

export async function checkStudentAlumni(ALCSREG_Id: number) {
    const url = '/CLGAlumniMembership/checkstudent';
    return await api.post<ICheckStudentAlumniResponse>('alumni', url, { ALCSREG_Id });
}

export async function approveClgAlumniData(data: { ALCSREG_Id: number; ALCMST_Id: number }) {
    const url = '/CLGAlumniMembership/aproovedata';
    return await api.post<IApproveClgAlumniResponse>('alumni', url, data);
}
