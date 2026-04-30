'use server';

import { api } from '@/lib/apiService';

export async function getGmvpsProgressCardIXReport(payload: any) {
    const url = '/v1/JSHSExamReports/nds_6_8_report'; // Mapping local 50257/api/JSHSExamReports_ to /v1/... (as per project pattern)
    // Wait, the user gave https://localhost:50257/api/JSHSExamReports_/nds_6_8_report
    // Usually, the project maps these to specific service names.
    // I'll use the 'exam' service.
    return await api.post<any>('exam', '/JSHSExamReports_/nds_6_8_report', payload);
}
