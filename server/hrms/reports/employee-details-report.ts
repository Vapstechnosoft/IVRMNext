'use server';

import { api } from '@/lib/apiService';
import type {
    EmployeeDetailsReportFilterRequest,
    EmployeeDetailsReportFilterResponse,
    EmployeeDetailsReportOnloadRequest,
    EmployeeDetailsReportOnloadResponse,
    EmployeeDetailsReportSearchRequest,
    EmployeeDetailsReportSearchResponse
} from '@/types/hrms/reports/employee-details-report';

export async function getEmployeeDetailsReportOnload(MI_Id = 30, LogInUserId = 2) {
    const requestBody: EmployeeDetailsReportOnloadRequest = {
        MI_Id,
        LogInUserId
    };
    return await api.post<EmployeeDetailsReportOnloadResponse>('hrms', '/api/EmployeeDetailsReportFacade/onloadgetdetailsNew', requestBody);
}

export async function filterEmployeeDetailsReport(requestBody: EmployeeDetailsReportFilterRequest) {
    return await api.post<EmployeeDetailsReportFilterResponse>('hrms', '/api/EmployeeDetailsReportFacade/FilterEmployeeDataNew', requestBody);
}

export async function searchEmployeeDetailsReport(requestBody: EmployeeDetailsReportSearchRequest) {
    return await api.post<EmployeeDetailsReportSearchResponse>('hrms', '/api/EmployeeDetailsReportFacade/getEmployeedetailsBySelectionNew', requestBody);
}
