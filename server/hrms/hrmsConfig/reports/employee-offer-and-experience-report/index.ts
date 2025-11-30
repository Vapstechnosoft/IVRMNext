'use server';
import { api, type ApiResponse } from '@/lib/apiService';
import type {
    EmployeeOfferAndExperienceReportFilterRequest,
    EmployeeOfferAndExperienceReportFilterResponse,
    EmployeeOfferAndExperienceReportSearchRequest,
    EmployeeOfferAndExperienceReportSearchResponse
} from '@/types/hrms/reports/employee-offer-and-experience-report';
/**
 * Filter employee data for offer and experience report
 * POST /api/EmployeeOfferAndExperienceReportFacade/FilterEmployeeData
 * Request: { MI_Id, HRMGT_Id, HRMD_Id, HRMDES_Id, LogInUserId }
 */
export async function filterEmployeeOfferAndExperienceData(
    requestBody: EmployeeOfferAndExperienceReportFilterRequest
): Promise<ApiResponse<EmployeeOfferAndExperienceReportFilterResponse>> {
    console.log('📥 [EMPLOYEE OFFER AND EXPERIENCE REPORT] Request payload:', JSON.stringify(requestBody, null, 2));
    const url = '/api/EmployeeOfferAndExperienceReportFacade/FilterEmployeeData';
    try {
        const response = await api.post<EmployeeOfferAndExperienceReportFilterResponse>(
            'hrms',
            url,
            requestBody
        );
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as unknown as EmployeeOfferAndExperienceReportFilterResponse;
            console.log('📊 [EMPLOYEE OFFER AND EXPERIENCE REPORT] Response data summary:', {
                hasEmployeedropdown: !!responseData?.employeedropdown,
                employeedropdownCount: Array.isArray(responseData?.employeedropdown) ? responseData.employeedropdown.length : 0,
                retrunMsg: responseData?.retrunMsg
            });
            return response as ApiResponse<EmployeeOfferAndExperienceReportFilterResponse>;
        }
        // Wrap raw response data
        const rawResponse = response as unknown as EmployeeOfferAndExperienceReportFilterResponse;
        return {
            success: true,
            message: rawResponse?.retrunMsg || 'Filter completed successfully',
            data: rawResponse
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Failed to filter employee data',
            data: null
        };
    }
}
/**
 * Get employee details by selection for offer and experience report
 * POST /api/EmployeeOfferAndExperienceReportFacade/getEmployeedetailsBySelection
 * Request: { MI_Id, HRMGT_Id, HRMD_Id, HRMDES_Id, LogInUserId }
 */
export async function getEmployeeDetailsBySelection(
    requestBody: EmployeeOfferAndExperienceReportSearchRequest
): Promise<ApiResponse<EmployeeOfferAndExperienceReportSearchResponse>> {
    console.log('📥 [EMPLOYEE OFFER AND EXPERIENCE REPORT] Request payload:', JSON.stringify(requestBody, null, 2));
    const url = '/api/EmployeeOfferAndExperienceReportFacade/getEmployeedetailsBySelection';
    try {
        const response = await api.post<EmployeeOfferAndExperienceReportSearchResponse>(
            'hrms',
            url,
            requestBody
        );
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as unknown as EmployeeOfferAndExperienceReportSearchResponse;
            console.log('📊 [EMPLOYEE OFFER AND EXPERIENCE REPORT] Response data summary:', {
                hasEmployeedropdown: !!responseData?.employeedropdown,
                employeedropdownCount: Array.isArray(responseData?.employeedropdown) ? responseData.employeedropdown.length : 0,
                retrunMsg: responseData?.retrunMsg
            });
            return response as ApiResponse<EmployeeOfferAndExperienceReportSearchResponse>;
        }
        // Wrap raw response data
        const rawResponse = response as unknown as EmployeeOfferAndExperienceReportSearchResponse;
        return {
            success: true,
            message: rawResponse?.retrunMsg || 'Employee details retrieved successfully',
            data: rawResponse
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Failed to get employee details',
            data: null
        };
    }
}
