'use server';
import { api, type ApiResponse } from '@/lib/apiService';
import type {
    EmployeeContributionReportFilterRequest,
    EmployeeContributionReportFilterResponse,
    EmployeeContributionReportFilterResponseType,
    EmployeeContributionReportOnloadRequest,
    EmployeeContributionReportOnloadResponse,
    EmployeeContributionReportResponse,
    EmployeeContributionReportSearchRequest,
    EmployeeContributionReportSearchResponse,
    EmployeeContributionReportSearchResponseType
} from '@/types/hrms/reports/employee-contribution-report';
/**
 * Get onload details for employee contribution report
 * POST /api/EmployeeContributionReportFacade/onloadgetdetails
 * Request: { MI_Id: number, LogInUserId: number }
 * Response: Returns dropdown data (months, years, departments, designations, group types, employee types, earning/deduction heads)
 */
export async function getEmployeeContributionReportOnload(
    MI_Id = 30,
    LogInUserId = 0
): Promise<ApiResponse<EmployeeContributionReportResponse>> {
    const requestBody: EmployeeContributionReportOnloadRequest = {
        MI_Id,
        LogInUserId
    };
    const response = await api.post<EmployeeContributionReportResponse>(
        'hrms',
        '/api/EmployeeContributionReportFacade/onloadgetdetails',
        requestBody
    );
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response as ApiResponse<EmployeeContributionReportResponse>;
    }
    // Wrap raw response data
    return {
        success: true,
        message: 'Data loaded successfully',
        data: response as unknown as EmployeeContributionReportResponse
    };
}
/**
 * Filter employee contribution data
 * POST /api/EmployeeContributionReportFacade/FilterEmployeeData
 * Request: { MI_Id, FormatType, MonthBetweenDates, hreS_Month, hreS_Year, FromDate, ToDate, designationselected, departmentselected, groupTypeselected }
 * Note: Arrays should be [0] when empty, not []
 */
export async function filterEmployeeContributionData(
    request: EmployeeContributionReportFilterRequest
): Promise<EmployeeContributionReportFilterResponseType> {
    // Ensure arrays are [0] when empty
    const requestBody: EmployeeContributionReportFilterRequest = {
        MI_Id: request.MI_Id,
        FormatType: request.FormatType || '',
        MonthBetweenDates: request.MonthBetweenDates || '',
        hreS_Month: request.hreS_Month || '',
        hreS_Year: request.hreS_Year || '',
        FromDate: request.FromDate || '',
        ToDate: request.ToDate || '',
        designationselected: request.designationselected.length > 0 ? request.designationselected : [0],
        departmentselected: request.departmentselected.length > 0 ? request.departmentselected : [0],
        groupTypeselected: request.groupTypeselected.length > 0 ? request.groupTypeselected : [0]
    };
    const response = await api.post<EmployeeContributionReportFilterResponse>(
        'hrms',
        '/api/EmployeeContributionReportFacade/FilterEmployeeData',
        requestBody
    );
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response as EmployeeContributionReportFilterResponseType;
    }
    // Wrap raw response data
    const rawResponse = response as unknown as EmployeeContributionReportFilterResponse;
    return {
        success: true,
        message: rawResponse?.retrunMsg || 'Filter completed successfully',
        data: rawResponse
    };
}
/**
 * Get employee contribution details by selection
 * POST /api/EmployeeContributionReportFacade/getEmployeedetailsBySelection
 * Request: { MI_Id, designationselected, departmentselected, groupTypeselected, MonthBetweenDates, hreS_Month, hreS_Year, FromDate, ToDate, FormatType, HRME_Id, EarningDeduction, EarningHead, DeductionHead }
 * Note: Arrays should be [0] when empty, not []
 */
export async function searchEmployeeContributionDetails(
    request: EmployeeContributionReportSearchRequest
): Promise<EmployeeContributionReportSearchResponseType> {
    // Ensure arrays are [0] when empty
    const requestBody: EmployeeContributionReportSearchRequest = {
        MI_Id: request.MI_Id || 30,
        designationselected: request.designationselected.length > 0 ? request.designationselected : [0],
        departmentselected: request.departmentselected.length > 0 ? request.departmentselected : [0],
        groupTypeselected: request.groupTypeselected.length > 0 ? request.groupTypeselected : [0],
        MonthBetweenDates: request.MonthBetweenDates || '',
        hreS_Month: request.hreS_Month || '',
        hreS_Year: request.hreS_Year || '',
        FromDate: request.FromDate || '',
        ToDate: request.ToDate || '',
        FormatType: request.FormatType || '',
        HRME_Id: request.HRME_Id || 0,
        EarningDeduction: request.EarningDeduction || '',
        EarningHead: request.EarningHead || 0,
        DeductionHead: request.DeductionHead || 0
    };
    const response = await api.post<EmployeeContributionReportSearchResponse>(
        'hrms',
        '/api/EmployeeContributionReportFacade/getEmployeedetailsBySelection',
        requestBody
    );
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response as EmployeeContributionReportSearchResponseType;
    }
    // Wrap raw response data
    const rawResponse = response as unknown as EmployeeContributionReportSearchResponse;
    return {
        success: true,
        message: rawResponse?.retrunMsg || 'Search completed successfully',
        data: rawResponse
    };
}
