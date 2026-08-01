'use server';

import { api } from '@/lib/apiService';

export async function getSamarthaProgressCardReportPromotion(data: any) {
    try {
        const url = 'JSHSExamReports/nds_9_report';
        const response = await api.post<any>('exam', url, data);
        if (response && response.status === 200) {
            return { success: true, data: response.data };
        }
        return { success: false, message: 'Failed to fetch report data' };
    } catch (error) {
        console.error('Error in getSamarthaProgressCardReportPromotion:', error);
        return { success: false, message: 'An error occurred while fetching report data' };
    }
}
