'use server';

import { api, type ApiResponse } from '@/lib/apiService';


export async function getTransportReportData(data: any) {
    const url = '/transport_report/transport_report';
    return await api.post<any>('transport', url, data);
}