'use server';

import { api } from '@/lib/apiService';
import { IBankCopyReportParams, IBankCopyReportResponse } from '@/types/pettycash/BankCopyReport';

export async function getBankCopyReportInitialData() {
    const url = '/BankCopyReportVVVS/get_initial_data';
    return await api.get<any>('pettycashandassettracking', url);
}

export async function getBankCopyReport(data: IBankCopyReportParams) {
    const url = '/BankCopyReportVVVS/get_report';
    return await api.post<IBankCopyReportResponse>('pettycashandassettracking', url, data);
}

export async function getBankCopyReportDetails(data: any) {
    const url = '/FeesCommon/ivrm-month-list';
    return await api.post<any>('pettycashandassettracking', url, data);
}
