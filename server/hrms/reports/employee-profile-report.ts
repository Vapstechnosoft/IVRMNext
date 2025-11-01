'use server';

import { api } from '@/lib/apiService';
import type {
    EmployeeProfileReportFilterRequest,
    EmployeeProfileReportFilterResponse,
    EmployeeProfileReportOnloadRequest,
    EmployeeProfileReportOnloadResponse,
    EmployeeProfileReportResponse,
    EmployeeProfileReportSearchRequest,
    EmployeeProfileReportSearchResponse
} from '@/types/hrms/reports/employee-profile-report';

/**
 * Get onload details for employee profile report
 * POST /api/EmployeeProfileReportFacade/onloadgetdetailsNew
 */
export async function getEmployeeProfileReportOnload(roleId = 30) {
    const requestBody: EmployeeProfileReportOnloadRequest = {
        MI_Id: roleId,
        roleId: roleId,
        retrunMsg: '',
        groupTypedropdown: [],
        departmentdropdown: [],
        designationdropdown: [],
        employeedropdown: []
    };
    return await api.post<EmployeeProfileReportResponse>('hrms', '/api/EmployeeProfileReportFacade/onloadgetdetailsNew', requestBody);
}

/**
 * Filter employees by selection criteria
 * POST /api/EmployeeProfileReportFacade/FilterEmployeedetailsBySelectionNew
 */
export async function filterEmployeesBySelection(request: EmployeeProfileReportFilterRequest) {
    const requestBody = {
        MI_Id: request.MI_Id,
        LogInUserId: request.LogInUserId,
        hrmgT_IdList: request.hrmgT_IdList || [0],
        hrmD_IdList: request.hrmD_IdList || [0],
        hrmdeS_IdList: request.hrmdeS_IdList || [0]
    };
    return await api.post<any>('hrms', '/api/EmployeeProfileReportFacade/FilterEmployeedetailsBySelectionNew', requestBody);
}

/**
 * Search employee profile details
 * POST /api/EmployeeProfileReportFacade/getEmployeedetailsBySelectionNew
 */
export async function searchEmployeeProfileDetails(request: EmployeeProfileReportSearchRequest) {
    const requestBody = {
        MI_Id: request.MI_Id,
        hrmE_multiId: request.employeeIds.length > 0 ? request.employeeIds : [0]
    };
    return await api.post<any>('hrms', '/api/EmployeeProfileReportFacade/getEmployeedetailsBySelectionNew', requestBody);
}
