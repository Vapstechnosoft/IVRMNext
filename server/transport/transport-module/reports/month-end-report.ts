'use server';

import { api } from '@/lib/apiService';
import type { IMonthEndReportParams, IMonthEndReportResponse } from '@/types/transport/transport-module/reports';

export async function getMonthEndReportInitialData() {
    const pageid = 2; // As per reference code
    const url = `/TrnsMonthEndReport/getdata/${pageid}`;
    return await api.get<IMonthEndReportResponse>('default', url);
}

export async function saveMonthEndReportData(data: any) {
    const url = '/trns_monthend_report/transport_month_end_report';
    return await api.post<any>('transport', url, data);
}

