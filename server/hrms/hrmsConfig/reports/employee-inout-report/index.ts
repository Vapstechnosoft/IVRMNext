'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    EmployeeInOutReportOnloadRequest,
    EmployeeInOutReportOnloadResponse,
    EmployeeInOutReportGetDataResponse
} from '@/types/hrms/reports/employee-inout-report';

/**
 * Get onload data for employee in-out report
 * This endpoint returns filter dropdowns (types/group types)
 * POST /api/EmployeeInOutReportFacade/getdata
 */
export async function getEmployeeInOutReportOnload(
    MI_Id = 30,
    LoginUserId = 0,
    UserRole = ''
): Promise<ApiResponse<EmployeeInOutReportOnloadResponse>> {
    const url = '/api/EmployeeInOutReportFacade/getdata';
    
    // Build request body
    const requestBody: EmployeeInOutReportOnloadRequest = {
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
    
    const response = await api.post<EmployeeInOutReportGetDataResponse>('hrmsfrontoffice', url, requestBody);
    
    // The backend returns data in ApiResponse format
    // Structure: { success: true, message: "OK", data: { types: [...], lieo: null, lateInApproval: null }, total: 0, page: 1, page_size: 10 }
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        const responseData = response.data;
        
        if (responseData) {
            const data = responseData as any;
            return {
                success: response.success,
                message: response.message || 'Data loaded successfully',
                data: {
                    types: data.types || [],
                    lieo: data.lieo || null,
                    lateInApproval: data.lateInApproval || null
                }
            };
        }
    }
    
    // Return empty data if response structure is unexpected
    return {
        success: false,
        message: 'Failed to load data',
        data: {
            types: [],
            lieo: null,
            lateInApproval: null
        }
    };
}

/**
 * Get employee in-out report data with pagination, search, and sort
 * TODO: Replace this with the actual search endpoint once provided
 * This is a placeholder that will be updated when the search endpoint is available
 */
export async function getEmployeeInOutReportList(
    searchParams?: ApiSearchparams,
    filterParams?: {
        MIID?: number;
        LoginUserId?: number;
        UserRole?: string;
        is_export?: boolean;
        // Filter parameters for in-out report
        fromDate?: string;
        toDate?: string;
        typeIdList?: number[];
        departmentIdList?: number[];
        designationIdList?: number[];
        allOrIndividual?: 'All' | 'Individual';
        employeeCode?: string;
        timeInTimeOut?: 'Time In' | 'Time Out' | 'In Out';
    }
): Promise<ApiResponse<any>> {
    // TODO: Replace this URL with the actual search endpoint
    const _url = '/api/EmployeeInOutReportFacade/search'; // PLACEHOLDER - update when search endpoint is provided
    
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
    if (filterParams?.allOrIndividual) {
        requestBody.allOrIndividual = filterParams.allOrIndividual;
    }
    if (filterParams?.employeeCode) {
        requestBody.employeeCode = filterParams.employeeCode;
    }
    if (filterParams?.timeInTimeOut) {
        requestBody.timeInTimeOut = filterParams.timeInTimeOut;
    }
    
    // TODO: Uncomment and update when search endpoint is available
    // const response = await api.post<any>('hrmsfrontoffice', url, requestBody);
    
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

