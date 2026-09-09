'use server';

import { api } from '@/lib/apiService';
import type { IFeeChallanReportItem, IFeeChallanReportRequest, IFeeChallanReportResponse } from '@/types/fees/reports/reports';

export async function getFeeChallanReport(data: IFeeChallanReportRequest): Promise<IFeeChallanReportResponse> {
    const url = '/FeeChallanReportFacade/getreport';
    try {
        const response = await api.post<any>('fees', url, data);
        if (response && response.data && Array.isArray(response.data)) {
            return {
                success: response.success ?? true,
                message: response.message || 'Report fetched successfully',
                data: response.data
            };
        }
        if (Array.isArray(response)) {
            return {
                success: true,
                data: response
            };
        }
        return {
            success: true,
            data: response?.reportlist || response?.data || []
        };
    } catch (error: any) {
        console.error('[server] getFeeChallanReport error:', error);
        return {
            success: false,
            message: error?.message || 'Failed to fetch Fee Challan Report',
            data: []
        };
    }
}
