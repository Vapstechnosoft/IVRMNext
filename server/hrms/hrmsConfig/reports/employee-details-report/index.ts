'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import type {
    EmployeeDetailsReportFilterRequest,
    EmployeeDetailsReportFilterResponse,
    EmployeeDetailsReportOnloadRequest,
    EmployeeDetailsReportOnloadResponse,
    EmployeeDetailsReportSearchRequest,
    EmployeeDetailsReportSearchResponse
} from '@/types/hrms/reports/employee-details-report';

/**
 * Get onload data for employee details report
 * POST /api/EmployeeDetailsReportFacade/onloadgetdetails
 * Returns dropdown data (months, leave years, departments, designations, employee types, group types)
 */
export async function getEmployeeDetailsReportOnload(
    MI_Id = 30,
    LogInUserId = 0
): Promise<ApiResponse<EmployeeDetailsReportOnloadResponse>> {
    const requestBody: EmployeeDetailsReportOnloadRequest = {
        MI_Id,
        LogInUserId
    };
    const response = await api.post<EmployeeDetailsReportOnloadResponse>(
        'hrms',
        '/api/EmployeeDetailsReportFacade/onloadgetdetails',
        requestBody
    );

    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response as ApiResponse<EmployeeDetailsReportOnloadResponse>;
    }

    // Wrap raw response data
    return {
        success: true,
        message: 'Data loaded successfully',
        data: response as unknown as EmployeeDetailsReportOnloadResponse
    };
}

export async function filterEmployeeDetailsReport(
    requestBody: EmployeeDetailsReportFilterRequest
): Promise<ApiResponse<EmployeeDetailsReportFilterResponse>> {
    const response = await api.post<EmployeeDetailsReportFilterResponse>(
        'hrms',
        '/api/EmployeeDetailsReportFacade/FilterEmployeeDataNew',
        requestBody
    );

    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response as ApiResponse<EmployeeDetailsReportFilterResponse>;
    }

    // Wrap raw response data
    const rawResponse = response as unknown as EmployeeDetailsReportFilterResponse;
    return {
        success: true,
        message: rawResponse?.retrunMsg || 'Filter completed successfully',
        data: rawResponse
    };
}

export async function searchEmployeeDetailsReport(
    requestBody: EmployeeDetailsReportSearchRequest
): Promise<ApiResponse<EmployeeDetailsReportSearchResponse>> {
    const response = await api.post<EmployeeDetailsReportSearchResponse>(
        'hrms',
        '/api/EmployeeDetailsReportFacade/getEmployeedetailsBySelectionNew',
        requestBody
    );

    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response as ApiResponse<EmployeeDetailsReportSearchResponse>;
    }

    // Wrap raw response data
    const rawResponse = response as unknown as EmployeeDetailsReportSearchResponse;
    return {
        success: true,
        message: rawResponse?.retrunMsg || 'Search completed successfully',
        data: rawResponse
    };
}
