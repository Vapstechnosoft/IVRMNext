'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    EmployeeInOutReportOnloadRequest,
    EmployeeInOutReportOnloadResponse,
    EmployeeInOutReportGetDataResponse,
    EmployeeInOutReportDepartmentRequest,
    EmployeeInOutReportDepartment,
    EmployeeInOutReportDesignationRequest,
    EmployeeInOutReportDesignation,
    EmployeeInOutReportEmployeeRequest,
    EmployeeInOutReportEmployee
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

/**
 * Get departments based on selected types
 * POST /api/EmployeeInOutReportFacade/get_departments
 */
export async function getEmployeeInOutReportDepartments(
    MI_Id = 30,
    UserId = 0,
    IVRMRT_Id = 0,
    multipletype = ''
): Promise<ApiResponse<EmployeeInOutReportDepartment[]>> {
    const url = '/api/EmployeeInOutReportFacade/get_departments';
    
    const requestBody: EmployeeInOutReportDepartmentRequest = {
        MI_Id,
        UserId,
        IVRMRT_Id,
        multipletype
    };
    
    try {
        const response = await api.post<any>('hrmsfrontoffice', url, requestBody);
        
        // Debug logging (remove in production if needed)
        if (process.env.NODE_ENV === 'development') {
            console.log('📋 [getEmployeeInOutReportDepartments] Response:', JSON.stringify(response, null, 2));
        }
        
        if (response && typeof response === 'object') {
            let dataArray: any[] = [];
            
            // Handle case where response itself is an array
            if (Array.isArray(response)) {
                dataArray = response;
            }
            // Handle case where response has 'success' property
            else if ('success' in response) {
                // Handle different response structures
                if (Array.isArray(response.data)) {
                    dataArray = response.data;
                } else if (response.data && typeof response.data === 'object') {
                    // Try to find array in nested structure - check for 'departments' first (API specific)
                    if (Array.isArray(response.data.departments)) {
                        dataArray = response.data.departments;
                    } else if (Array.isArray(response.data.$values)) {
                        dataArray = response.data.$values;
                    } else if (Array.isArray(response.data.departmentList)) {
                        dataArray = response.data.departmentList;
                    } else if (Array.isArray(response.data.departmentdropdown)) {
                        dataArray = response.data.departmentdropdown;
                    } else if (Array.isArray(response.data.DepartmentTempDto)) {
                        dataArray = response.data.DepartmentTempDto;
                    } else if (Array.isArray(response.data.departmentdropdownlist)) {
                        dataArray = response.data.departmentdropdownlist;
                    } else if (Array.isArray(response.data)) {
                        dataArray = response.data;
                    }
                }
            }
            // Handle case where response.data might be directly accessible
            else if ((response as any).data) {
                if (Array.isArray((response as any).data)) {
                    dataArray = (response as any).data;
                }
            }
            
            return {
                success: response.success ?? true,
                message: response.message || 'Data loaded successfully',
                data: dataArray
            };
        }
        
        return {
            success: false,
            message: 'Failed to load departments - unexpected response format',
            data: []
        };
    } catch (error) {
        console.error('❌ [getEmployeeInOutReportDepartments] Error:', error);
        return {
            success: false,
            message: 'Error loading departments',
            data: []
        };
    }
}

/**
 * Get designations based on selected departments
 * POST /api/EmployeeInOutReportFacade/get_designation
 */
export async function getEmployeeInOutReportDesignations(
    MI_Id = 30,
    multipledep = ''
): Promise<ApiResponse<EmployeeInOutReportDesignation[]>> {
    const url = '/api/EmployeeInOutReportFacade/get_designation';
    
    const requestBody: EmployeeInOutReportDesignationRequest = {
        MI_Id,
        multipledep
    };
    
    try {
        const response = await api.post<any>('hrmsfrontoffice', url, requestBody);
        
        // Debug logging (remove in production if needed)
        if (process.env.NODE_ENV === 'development') {
            console.log('📋 [getEmployeeInOutReportDesignations] Response:', JSON.stringify(response, null, 2));
        }
        
        if (response && typeof response === 'object') {
            let dataArray: any[] = [];
            
            // Handle case where response itself is an array
            if (Array.isArray(response)) {
                dataArray = response;
            }
            // Handle case where response has 'success' property
            else if ('success' in response) {
                // Handle different response structures
                if (Array.isArray(response.data)) {
                    dataArray = response.data;
                } else if (response.data && typeof response.data === 'object') {
                    // Try to find array in nested structure - check for 'designations' first (API specific)
                    if (Array.isArray(response.data.designations)) {
                        dataArray = response.data.designations;
                    } else if (Array.isArray(response.data.$values)) {
                        dataArray = response.data.$values;
                    } else if (Array.isArray(response.data.designationlList)) {
                        dataArray = response.data.designationlList;
                    } else if (Array.isArray(response.data.designationdropdown)) {
                        dataArray = response.data.designationdropdown;
                    } else if (Array.isArray(response.data.DesignationTempDto)) {
                        dataArray = response.data.DesignationTempDto;
                    } else if (Array.isArray(response.data.designationdropdownlist)) {
                        dataArray = response.data.designationdropdownlist;
                    } else if (Array.isArray(response.data.designationarray)) {
                        dataArray = response.data.designationarray;
                    } else if (Array.isArray(response.data)) {
                        dataArray = response.data;
                    }
                }
            }
            // Handle case where response.data might be directly accessible
            else if ((response as any).data) {
                if (Array.isArray((response as any).data)) {
                    dataArray = (response as any).data;
                }
            }
            
            return {
                success: response.success ?? true,
                message: response.message || 'Data loaded successfully',
                data: dataArray
            };
        }
        
        return {
            success: false,
            message: 'Failed to load designations - unexpected response format',
            data: []
        };
    } catch (error) {
        console.error('❌ [getEmployeeInOutReportDesignations] Error:', error);
        return {
            success: false,
            message: 'Error loading designations',
            data: []
        };
    }
}

/**
 * Get employees based on selected types, departments, and designations
 * POST /api/EmployeeInOutReportFacade/get_employee
 */
export async function getEmployeeInOutReportEmployees(
    MI_Id = 30,
    multipledes = '',
    multipledep = '',
    multipletype = ''
): Promise<ApiResponse<EmployeeInOutReportEmployee[]>> {
    const url = '/api/EmployeeInOutReportFacade/get_employee';
    
    const requestBody: EmployeeInOutReportEmployeeRequest = {
        MI_Id,
        multipledes,
        multipledep,
        multipletype
    };
    
    try {
        const response = await api.post<any>('hrmsfrontoffice', url, requestBody);
        
        // Debug logging (remove in production if needed)
        if (process.env.NODE_ENV === 'development') {
            console.log('📋 [getEmployeeInOutReportEmployees] Response:', JSON.stringify(response, null, 2));
        }
        
        if (response && typeof response === 'object') {
            let dataArray: any[] = [];
            
            // Handle case where response itself is an array
            if (Array.isArray(response)) {
                dataArray = response;
            }
            // Handle case where response has 'success' property
            else if ('success' in response) {
                // Handle different response structures
                if (Array.isArray(response.data)) {
                    dataArray = response.data;
                } else if (response.data && typeof response.data === 'object') {
                    // Try to find array in nested structure - check for 'employees' first (API specific)
                    if (Array.isArray(response.data.employees)) {
                        dataArray = response.data.employees;
                    } else if (Array.isArray(response.data.$values)) {
                        dataArray = response.data.$values;
                    } else if (Array.isArray(response.data.employeeList)) {
                        dataArray = response.data.employeeList;
                    } else if (Array.isArray(response.data.EmployeeTempDto)) {
                        dataArray = response.data.EmployeeTempDto;
                    } else if (Array.isArray(response.data.employeedropdownlist)) {
                        dataArray = response.data.employeedropdownlist;
                    } else if (Array.isArray(response.data)) {
                        dataArray = response.data;
                    }
                }
            }
            // Handle case where response.data might be directly accessible
            else if ((response as any).data) {
                if (Array.isArray((response as any).data)) {
                    dataArray = (response as any).data;
                }
            }
            
            return {
                success: response.success ?? true,
                message: response.message || 'Data loaded successfully',
                data: dataArray
            };
        }
        
        return {
            success: false,
            message: 'Failed to load employees - unexpected response format',
            data: []
        };
    } catch (error) {
        console.error('❌ [getEmployeeInOutReportEmployees] Error:', error);
        return {
            success: false,
            message: 'Error loading employees',
            data: []
        };
    }
}

