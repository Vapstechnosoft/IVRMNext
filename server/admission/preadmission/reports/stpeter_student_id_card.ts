'use server';

import { api } from '@/lib/apiService';

export async function getStpeterStudentIdCardLoadData() {
    return await api.get<any>('admission', '/StudentIdCardFormat/OnLoadStudentIdCardDetails/2');
}

export async function changeYearStpeterStudentIdCard(data: { ASMAY_Id: number }) {
    return await api.post<any>('admission', '/StudentIdCardFormat/OnChangeYear', data);
}

export async function changeClassStpeterStudentIdCard(data: { ASMAY_Id: number; ASMCL_Id: number }) {
    return await api.post<any>('admission', '/StudentIdCardFormat/OnChangeClass', data);
}

export async function changeSectionStpeterStudentIdCard(data: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number }) {
    return await api.post<any>('admission', '/StudentIdCardFormat/OnChangeSection', data);
}

export async function getStpeterStudentIdCardReport(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    StudentTempList: any[];
}) {
    return await api.post<any>('admission', '/StudentIdCardFormat/GetReportDetails', data);
}
