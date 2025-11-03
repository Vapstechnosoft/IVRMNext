'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import type {
    CumulativeSalaryReportOnloadResponse,
    CumulativeSalaryReportSearchRequest,
    CumulativeSalaryReportSearchResponse
} from '@/types/hrms/reports/cumulative-salary-report';

export async function getCumulativeSalaryReportOnload(MI_Id = 30): Promise<ApiResponse<CumulativeSalaryReportOnloadResponse>> {
    const url = `/api/CumulativeSalaryReportFacade/onloadgetdetailsNew?mid=${MI_Id}`;
    const response = await api.post<CumulativeSalaryReportOnloadResponse>('hrms', url, {});
    
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response as ApiResponse<CumulativeSalaryReportOnloadResponse>;
    }
    
    // Wrap raw response data
    return {
        success: true,
        message: 'Data loaded successfully',
        data: response as unknown as CumulativeSalaryReportOnloadResponse
    };
}

export async function searchCumulativeSalaryReport(data: CumulativeSalaryReportSearchRequest): Promise<ApiResponse<CumulativeSalaryReportSearchResponse>> {
    const url = '/api/CumulativeSalaryReportFacade/GetEmployeedetailsBySelectionNew';
    
    // Ensure all array fields are present, even if empty
    const requestBody: CumulativeSalaryReportSearchRequest = {
        MI_Id: data.MI_Id || 30,
        HRES_Year: data.HRES_Year || '0',
        HRES_Month: data.HRES_Month || '0',
        groupTypeIdList: data.groupTypeIdList || [],
        hrmD_IdList: data.hrmD_IdList || [],
        hrmdeS_IdList: data.hrmdeS_IdList || [],
        LogInUserId: data.LogInUserId || 0
    };
    
    const response = await api.post<CumulativeSalaryReportSearchResponse>('hrms', url, requestBody);
    
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response as ApiResponse<CumulativeSalaryReportSearchResponse>;
    }
    
    // Wrap raw response data
    const rawResponse = response as unknown as CumulativeSalaryReportSearchResponse;
    return {
        success: true,
        message: rawResponse?.retrunMsg || 'Search completed successfully',
        data: rawResponse
    };
}

export async function testCumulativeSalaryReportAPI(MI_Id = 30) {
    return await getCumulativeSalaryReportOnload(MI_Id);
}
