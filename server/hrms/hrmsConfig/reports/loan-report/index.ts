'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import type {
    LoanReportBasicDataRequest,
    LoanReportFilterRequest,
    LoanReportResponse,
    LoanReportSearchRequest
} from '@/types/hrms/reports/loan-report';

/**
 * Get basic data for loan report (onload)
 * POST /api/EmployeeLoanReport/getBasicData
 */
export async function getLoanReportBasicData(
    MI_Id = 30,
    roleId = 0,
    LogInUserId = 0
): Promise<ApiResponse<LoanReportResponse>> {
    const requestBody: LoanReportBasicDataRequest = {
        MI_Id,
        roleId,
        LogInUserId
    };
    const response = await api.post<LoanReportResponse>(
        'hrms',
        '/api/EmployeeLoanReport/getBasicData',
        requestBody
    );

    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response as ApiResponse<LoanReportResponse>;
    }

    // Wrap raw response data
    return {
        success: true,
        message: 'Data loaded successfully',
        data: response as unknown as LoanReportResponse
    };
}

/**
 * Get employee dropdown based on filters
 * POST /api/EmployeeLoanReport/getAllDropdownAndDatatableDetails
 */
export async function filterEmployeesForLoanReport(
    requestBody: LoanReportFilterRequest
): Promise<ApiResponse<LoanReportResponse>> {
    // Ensure all array fields are present, even if empty
    const request: LoanReportFilterRequest = {
        MI_Id: requestBody.MI_Id,
        roleId: requestBody.roleId || 0,
        LogInUserId: requestBody.LogInUserId || 0,
        hrmgT_IdList: requestBody.hrmgT_IdList || [0],
        hrmD_IdList: requestBody.hrmD_IdList || [0],
        hrmdeS_IdList: requestBody.hrmdeS_IdList || [0]
    };

    const response = await api.post<LoanReportResponse>(
        'hrms',
        '/api/EmployeeLoanReport/getAllDropdownAndDatatableDetails',
        request
    );

    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response as ApiResponse<LoanReportResponse>;
    }

    // Wrap raw response data
    const rawResponse = response as unknown as LoanReportResponse;
    return {
        success: true,
        message: 'Filter completed successfully',
        data: rawResponse
    };
}

/**
 * Get employee loan details by selection
 * POST /api/EmployeeLoanReport/getEmployeedetailsBySelection
 */
export async function getEmployeeLoanDetails(
    requestBody: LoanReportSearchRequest
): Promise<ApiResponse<LoanReportResponse>> {
    // Ensure all array fields are present, even if empty
    const request: LoanReportSearchRequest = {
        MI_Id: requestBody.MI_Id,
        roleId: requestBody.roleId || 0,
        LogInUserId: requestBody.LogInUserId || 0,
        hrmgT_IdList: requestBody.hrmgT_IdList || [0],
        hrmD_IdList: requestBody.hrmD_IdList || [0],
        hrmdeS_IdList: requestBody.hrmdeS_IdList || [0],
        hrmE_Id: requestBody.hrmE_Id || 0
    };

    const response = await api.post<LoanReportResponse>(
        'hrms',
        '/api/EmployeeLoanReport/getEmployeedetailsBySelection',
        request
    );

    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response as ApiResponse<LoanReportResponse>;
    }

    // Wrap raw response data
    const rawResponse = response as unknown as LoanReportResponse;
    return {
        success: true,
        message: rawResponse?.configurationDetails?.retrunMsg || 'Search completed successfully',
        data: rawResponse
    };
}

