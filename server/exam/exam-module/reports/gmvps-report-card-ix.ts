'use server';

import { api } from '@/lib/apiService';

export async function getGmvpsProgressCardIXReport(payload: any) {
    const url = '/v1/JSHSExamReports/nds_6_8_report';
    return await api.post<any>('exam', '/JSHSExamReports_/nds_6_8_report', payload);
}
