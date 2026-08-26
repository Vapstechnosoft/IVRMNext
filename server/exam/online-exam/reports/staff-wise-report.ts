'use server';

import { api } from '@/lib/apiService';
import type { IExamReportInitialData, INotSubmittedReportRow, IStaffWiseReportRow } from '@/types/exam/online-exam/reports';

// Get Initial dropdowns for Not Submitted / Staff Report
export async function getStaffWiseReportInitialData() {
    const url = '/LP_OE_StaffWiseExamReport/getloaddata';
    return await api.get<IExamReportInitialData>('exam', url);
}

// Generate Not Submitted Students Report
export async function getNotSubmittedReportData(filterData: {
    ASMAY_Id: number;
    ASMCL_Id?: number;
    ASMS_Id?: number;
    ISMS_Id?: number;
    LPMOEEX_Id: number;
}) {
    const url = '/LP_OE_StaffWiseExamReport/getnotsubmittedreport';
    return await api.post<INotSubmittedReportRow[]>('exam', url, filterData);
}

// Generate Staff Wise Performance Report
export async function getStaffWiseReportData(filterData: {
    ASMAY_Id: number;
    ASMCL_Id?: number;
    ASMS_Id?: number;
    ISMS_Id?: number;
    LPMOEEX_Id: number;
}) {
    const url = '/LP_OE_StaffWiseExamReport/getstaffwisereport';
    return await api.post<IStaffWiseReportRow[]>('exam', url, filterData);
}
