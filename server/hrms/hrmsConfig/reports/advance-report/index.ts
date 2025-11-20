import { api, type ApiResponse } from '@/lib/apiService';
import type {
    EmployeeAdvanceReportOnloadRequest,
    EmployeeAdvanceReportOnloadResponse,
    EmployeeAdvanceReportSearchRequest,
    EmployeeAdvanceReportSearchResponse
} from '@/types/hrms/reports/advance-report';

/**
 * Get Employee Advance Report onload data
 */
export async function getEmployeeAdvanceReportOnload(
    MI_Id: number,
    LogInUserId = 0
): Promise<ApiResponse<EmployeeAdvanceReportOnloadResponse>> {
    try {
        const request: EmployeeAdvanceReportOnloadRequest = {
            MI_Id,
            LogInUserId
        };

        console.log('/api/EmployeeAdvanceReportFacade/onloadgetdetails request', request);

        const response = await api.post<EmployeeAdvanceReportOnloadResponse>(
            'hrms',
            '/api/EmployeeAdvanceReportFacade/onloadgetdetails',
            request
        );

        console.log('/api/EmployeeAdvanceReportFacade/onloadgetdetails response', response);

        // Wrap the response in ApiResponse format
        if (response && typeof response === 'object') {
            return {
                success: true,
                data: response as unknown as EmployeeAdvanceReportOnloadResponse,
                message: 'Employee advance report onload data fetched successfully'
            };
        }

        return {
            success: false,
            data: null,
            message: 'Invalid response format from server'
        };
    } catch (error: any) {
        console.error('Error fetching employee advance report onload data:', error);
        return {
            success: false,
            data: null,
            message: error?.message || 'Failed to fetch employee advance report onload data'
        };
    }
}

/**
 * Search Employee Advance Report by selection
 */
export async function searchEmployeeAdvanceReport(
    request: EmployeeAdvanceReportSearchRequest
): Promise<ApiResponse<EmployeeAdvanceReportSearchResponse>> {
    try {
        console.log('/api/EmployeeAdvanceReportFacade/getEmployeedetailsBySelection request', request);

        const response = await api.post<EmployeeAdvanceReportSearchResponse>(
            'hrms',
            '/api/EmployeeAdvanceReportFacade/getEmployeedetailsBySelection',
            request
        );

        console.log('/api/EmployeeAdvanceReportFacade/getEmployeedetailsBySelection response', response);

        // Wrap the response in ApiResponse format
        if (response && typeof response === 'object') {
            return {
                success: true,
                data: response as unknown as EmployeeAdvanceReportSearchResponse,
                message: 'Employee advance report data fetched successfully'
            };
        }

        return {
            success: false,
            data: null,
            message: 'Invalid response format from server'
        };
    } catch (error: any) {
        console.error('Error searching employee advance report:', error);
        return {
            success: false,
            data: null,
            message: error?.message || 'Failed to search employee advance report'
        };
    }
}
