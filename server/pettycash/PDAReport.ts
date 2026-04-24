'use server';

import { api } from '@/lib/apiService';
import type { IPDAReportParams, IPDAReportResponse } from '@/types/pettycash/PDAReport';

export async function getPDAReportInitialData() {
    const url = '/PDAReport/getalldetails/2';
    return await api.get<IPDAReportResponse>('pettycash', url);
}

export async function getPDAReport(data: IPDAReportParams) {
    const url = `/Expenses/get_daily_income_expense_report/${data.From_Date}`;
    return await api.get<IPDAReportResponse>('pettycash', url, { params: data });
}

export async function getAcademicYearList() {
    const url = '/FeeStudentTransaction/academic-year-list';
    return await api.get<any[]>('fees', url);
}

export async function getinstitutionDetails() {
    const url = '/FeesCommon/institution-details';
    return await api.get<any[]>('fees', url);
}
