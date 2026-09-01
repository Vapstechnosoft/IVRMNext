'use server';

import { api } from '@/lib/apiService';
import type { IExamReportInitialData, IOnlineExamReportRow } from '@/types/exam/online-exam/reports';

// Get Initial Filter dropdowns for Report
export async function getOnlineExamReportInitialData() {
    const url = '/OnlineExamConfig/getloaddata';
    return await api.get<IExamReportInitialData>('exam', url);
}

// Generate Online Exam Report
export async function getOnlineExamReportData(filterData: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id?: number;
    LPMOEEX_Id: number;
    ISMS_Id?: number;
    fromDate?: string;
    toDate?: string;
}) {
    const url = '/OnlineExamConfig/getreport';
    return await api.post<IOnlineExamReportRow[]>('exam', url, filterData);
}
