'use server';

import { api } from '@/lib/apiService';
import type { IApiResponse, ICumulativeFeeAnalysisData } from '@/types/student-portal/masters/cumulative-fee-analysis';

export async function getCumulativeFeeAnalysisInitialData() {
    const url = 'CumulativeFeeAnalysis/getloaddata';
    return await api.get<IApiResponse<ICumulativeFeeAnalysisData>>('portal', url);
}

export async function getCumulativeFeeAnalysisReport(data: { ASMAY_Id: number }) {
    const url = 'CumulativeFeeAnalysis/onreport';
    return await api.post<IApiResponse<ICumulativeFeeAnalysisData>>('portal', url, data);
}
