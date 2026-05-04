'use server';

import { api } from '@/lib/apiService';

export async function getPromotionReportSophia(data: any) {
    try {
        const url = '/BaldwinAllReport/GetSopiaReport';
        const response = await api.post<any>('exam', url, data);
        return response;
    } catch (error) {
        console.error('getPromotionReportSophia error:', error);
        return {
            success: false,
            status: 500,
            message: 'Server error occurred while fetching report'
        };
    }
}
