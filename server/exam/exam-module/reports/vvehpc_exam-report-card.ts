'use server';

import { api } from '@/lib/apiService';

export async function getExamReportCard(data: any) {
    const url = '/individual_exam_report_card/exam_report_card';
    return await api.post<any>('exam', url, data);
}
