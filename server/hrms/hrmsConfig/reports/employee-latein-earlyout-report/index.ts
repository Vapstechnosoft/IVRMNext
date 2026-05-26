'use server';
import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    EmployeeLateInEarlyOutReportGetDataResponse,
    EmployeeLateInEarlyOutReportOnloadRequest,
    EmployeeLateInEarlyOutReportOnloadResponse
} from '@/types/hrms/reports/employee-latein-earlyout-report';
/**
 * Get onload data for employee late in early out report
 * This endpoint returns filter dropdowns (types/group types, employees, months, years)
 * POST /api/EmployeeLateInEarlyOutReportFacade/getdata
 */
export async function getEmployeeLateInEarlyOutReportOnload(
    MI_Id = 30,
    LoginUserId = 0,
    UserRole = ''
): Promise<ApiResponse<EmployeeLateInEarlyOutReportOnloadResponse>> {
    const url = '/api/EmployeeLateInEarlyOutReportFacade/getdata';
    // Build request body
    const requestBody: EmployeeLateInEarlyOutReportOnloadRequest = {
        page: 1,
        page_size: 10,
        search_query: '',
        search_column: '',
        sort_column: '',
        sort_direction: '',
        is_export: false,
        miid: MI_Id,
        loginUserId: LoginUserId,
        userRole: UserRole
    };
    let response: any;
    try {
        response = await api.post<EmployeeLateInEarlyOutReportGetDataResponse>('hrmsfrontoffice', url, requestBody);
    } catch (error: any) {
        // Return error response
        return {
            success: false,
            message:
                error?.response?.status === 404
                    ? `Endpoint not found: ${url}. Please verify the endpoint URL.`
                    : error?.message || 'Failed to load data from API',
            data: {
                types: [],
                employees: [],
                months: [],
                years: []
            }
        };
    }
    // The backend returns data in ApiResponse format
    // Structure: { success: true, message: "OK", data: { types: [...], employees: [...], months: [...], years: [...] }, total: 0, page: 1, page_size: 10 }
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        const responseData = response.data;
        if (responseData) {
            const result = {
                success: response.success,
                message: response.message || 'Data loaded successfully',
                data: {
                    types: responseData.types || [],
                    employees: responseData.employees || [],
                    months: responseData.months || [],
                    years: responseData.years || []
                }
            };
            return result;
        }
    }
    return {
        success: false,
        message: 'Failed to load data',
        data: {
            types: [],
            employees: [],
            months: [],
            years: []
        }
    };
}
/**
 * Get employee late in early out report data with pagination, search, and sort
 * TODO: Replace this with the actual search endpoint once provided
 * This is a placeholder that will be updated when the search endpoint is available
 */
export async function getEmployeeLateInEarlyOutReportList(
    searchParams?: ApiSearchparams,
    filterParams?: {
        MIID?: number;
        LoginUserId?: number;
        UserRole?: string;
        is_export?: boolean;
        // Filter parameters for late in early out report
        fromDate?: string;
        toDate?: string;
        typeIdList?: number[];
        departmentIdList?: number[];
        designationIdList?: number[];
        employeeIdList?: number[];
        allOrIndividual?: 'All' | 'Individual';
        employeeCode?: string;
        mode?: 'Late By' | 'Early Out' | 'Late In Early Out';
        month?: string;
        year?: string;
    }
): Promise<ApiResponse<any>> {
    // TODO: Replace this URL with the actual search endpoint
    const _url = '/api/EmployeeLateInEarlyOutReportFacade/search'; // PLACEHOLDER - update when search endpoint is provided
    // Build request body with pagination, search, sort, and filter params
    const requestBody: any = {
        page: searchParams?.page || 1,
        page_size: searchParams?.page_size || 10,
        search_query: searchParams?.search_query || '',
        search_column: searchParams?.search_column || '',
        sort_column: searchParams?.sort_column || '',
        sort_direction: searchParams?.sort_direction || '',
        is_export: filterParams?.is_export || false,
        miid: filterParams?.MIID || 30,
        loginUserId: filterParams?.LoginUserId || 0,
        userRole: filterParams?.UserRole || ''
    };
    // Add filter parameters
    if (filterParams?.fromDate) {
        requestBody.fromDate = filterParams.fromDate;
    }
    if (filterParams?.toDate) {
        requestBody.toDate = filterParams.toDate;
    }
    if (filterParams?.typeIdList && filterParams.typeIdList.length > 0) {
        requestBody.typeIdList = filterParams.typeIdList;
    }
    if (filterParams?.departmentIdList && filterParams.departmentIdList.length > 0) {
        requestBody.departmentIdList = filterParams.departmentIdList;
    }
    if (filterParams?.designationIdList && filterParams.designationIdList.length > 0) {
        requestBody.designationIdList = filterParams.designationIdList;
    }
    if (filterParams?.employeeIdList && filterParams.employeeIdList.length > 0) {
        requestBody.employeeIdList = filterParams.employeeIdList;
    }
    if (filterParams?.allOrIndividual) {
        requestBody.allOrIndividual = filterParams.allOrIndividual;
    }
    if (filterParams?.employeeCode) {
        requestBody.employeeCode = filterParams.employeeCode;
    }
    if (filterParams?.mode) {
        requestBody.mode = filterParams.mode;
    }
    if (filterParams?.month) {
        requestBody.month = filterParams.month;
    }
    if (filterParams?.year) {
        requestBody.year = filterParams.year;
    }
    // TODO: Uncomment and update when search endpoint is available
    // const response = await api.post<any>('hrms', url, requestBody);
    // For now, return empty response until search endpoint is provided
    return {
        success: false,
        message: 'Search endpoint not yet configured. Please provide the search endpoint URL.',
        data: {
            rows: [],
            total: 0,
            page: searchParams?.page || 1,
            page_size: searchParams?.page_size || 10
        }
    };
}
/**
 * Get employee late in/early out report data
 * POST /api/EmployeeLateInEarlyOutReportFacade/search
 */
export async function getEmployeeLateInEarlyOutReport(data: any, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'searchableColumns');
    const url = `/api/EmployeeLateInEarlyOutReportFacade/search?${urlParams}`;
    return await api.post<any>('hrmsfrontoffice', url, data);
}
