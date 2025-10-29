import { api } from '@/lib/apiService';
import type {
    EmployeeProfileReportFilterRequest,
    EmployeeProfileReportFilterResponse,
    EmployeeProfileReportOnloadRequest,
    EmployeeProfileReportOnloadResponse,
    EmployeeProfileReportResponse,
    EmployeeProfileReportSearchRequest,
    EmployeeProfileReportSearchResponse
} from '@/types/hrms/employee-profile-report';

/**
 * Get onload details for employee profile report
 * POST /api/EmployeeProfileReportFacade/onloadgetdetailsNew
 */
export async function getEmployeeProfileReportOnload(roleId = 30): Promise<EmployeeProfileReportOnloadResponse> {
    try {
        const requestBody: EmployeeProfileReportOnloadRequest = {
            MI_Id: roleId,
            roleId: roleId,
            retrunMsg: '',
            groupTypedropdown: [],
            departmentdropdown: [],
            designationdropdown: [],
            employeedropdown: []
        };

        const response = await api.post<EmployeeProfileReportResponse>('/api/EmployeeProfileReportFacade/onloadgetdetailsNew', requestBody);

        return {
            success: true,
            message: 'Employee profile report details loaded successfully',
            data: response.data
        };
    } catch (error: any) {
        console.error('Error fetching employee profile report onload details:', error);
        return {
            success: false,
            message: error.message || 'Failed to load employee profile report details',
            data: {
                MI_Id: roleId,
                roleId: roleId,
                retrunMsg: '',
                groupTypedropdown: [],
                departmentdropdown: [],
                designationdropdown: [],
                employeedropdown: []
            }
        };
    }
}

/**
 * Filter employees by selection criteria
 * POST /api/EmployeeProfileReportFacade/FilterEmployeedetailsBySelectionNew
 */
export async function filterEmployeesBySelection(
    request: EmployeeProfileReportFilterRequest
): Promise<EmployeeProfileReportFilterResponse> {
    try {
        const requestBody = {
            MI_Id: request.MI_Id,
            LogInUserId: request.LogInUserId,
            hrmgT_IdList: request.hrmgT_IdList || [0],
            hrmD_IdList: request.hrmD_IdList || [0],
            hrmdeS_IdList: request.hrmdeS_IdList || [0]
        };

        const response = await api.post<any>('/api/EmployeeProfileReportFacade/FilterEmployeedetailsBySelectionNew', requestBody);

        return {
            success: true,
            message: 'Employees filtered successfully',
            data: response.data
        };
    } catch (error: any) {
        console.error('Error filtering employees:', error);
        return {
            success: false,
            message: error.message || 'Failed to filter employees',
            data: {
                employeedropdown: []
            }
        };
    }
}

/**
 * Search employee profile details
 * POST /api/EmployeeProfileReportFacade/getEmployeedetailsBySelectionNew
 */
export async function searchEmployeeProfileDetails(
    request: EmployeeProfileReportSearchRequest
): Promise<EmployeeProfileReportSearchResponse> {
    try {
        const requestBody = {
            MI_Id: request.MI_Id,
            hrmE_multiId: request.employeeIds.length > 0 ? request.employeeIds : [0]
        };

        const response = await api.post<any>('/api/EmployeeProfileReportFacade/getEmployeedetailsBySelectionNew', requestBody);

        return {
            success: true,
            message: 'Employee profile details retrieved successfully',
            data: response.data
        };
    } catch (error: any) {
        console.error('Error fetching employee profile details:', error);
        return {
            success: false,
            message: error.message || 'Failed to retrieve employee profile details',
            data: {
                employeeDetails: {} as any,
                success: false,
                message: error.message || 'Failed to retrieve employee profile details'
            }
        };
    }
}
