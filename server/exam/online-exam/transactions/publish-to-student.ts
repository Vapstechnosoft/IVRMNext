'use server';

import { api } from '@/lib/apiService';
import type { IPublishInitialData, IPublishToStudentList } from '@/types/exam/online-exam/transactions';

// Get Initial Filter dropdowns
export async function getPublishInitialData() {
    const url = '/LP_OnlineExamPublishToStudent/getloaddata';
    return await api.get<IPublishInitialData>('exam', url);
}

// Get Exam student results to publish
export async function getPublishStudentList(filterData: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    ISMS_Id?: number;
    LPMOEEX_Id: number;
}) {
    const url = '/LP_OnlineExamPublishToStudent/getstudentlist';
    return await api.post<IPublishToStudentList[]>('exam', url, filterData);
}

// Save / Update Publish status to Student Portal
export async function savePublishToStudent(data: {
    LPMOEEX_Id: number;
    studentIds: number[];
    publishStatus: boolean;
}) {
    const url = '/LP_OnlineExamPublishToStudent/savedata';
    return await api.post<any>('exam', url, data);
}
