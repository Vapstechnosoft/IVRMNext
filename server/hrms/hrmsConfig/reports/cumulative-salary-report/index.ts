'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    CumulativeSalaryReportOnloadResponse,
    CumulativeSalaryReportListRequest,
    CumulativeSalaryReportListResponse,
    SalaryReportRecord
} from '@/types/hrms/reports/cumulative-salary-report';

/**
 * Get dropdown data for cumulative salary report
 * This endpoint ONLY returns filter dropdowns (group types, departments, designations, months, years)
 * NOTE: This endpoint should NOT be used for fetching report data - use the search endpoint instead
 */
export async function getCumulativeSalaryReportOnload(MI_Id = 30): Promise<ApiResponse<CumulativeSalaryReportOnloadResponse>> {
    const url = '/api/CumulativeSalaryReportFacade/onloadgetdetails';
    
    // Build request body - only basic params needed for dropdowns
    const requestBody = {
        page: 1,
        page_size: 10,
        search_query: '',
        search_column: '',
        sort_column: '',
        sort_direction: '',
        is_export: false,
        MIID: MI_Id,
        LoginUserId: 0,
        UserRole: ''
    };
    
    const response = await api.post<any>('hrms', url, requestBody);
    
    // The backend returns data in ApiResponse format
    // Structure: { success: true, message: "Success", data: { dropdown: {...}, rows: [...] } }
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // The dropdown is directly in response.data.dropdown, not response.data.data.dropdown
        const dropdownData = response.data?.dropdown;
        
        if (dropdownData) {
            return {
                success: response.success,
                message: response.message || 'Dropdown data loaded successfully',
                data: {
                    MI_Id: dropdownData.MI_Id || MI_Id,
                    groupTypedropdownlist: dropdownData.groupTypedropdownlist || [],
                    departmentdropdownlist: dropdownData.departmentdropdownlist || [],
                    designationdropdownlist: dropdownData.designationdropdownlist || [],
                    monthdropdown: dropdownData.monthdropdown || [],
                    leaveyeardropdown: dropdownData.leaveyeardropdown || []
                }
            };
        }
    }
    
    // Return empty dropdowns if response structure is unexpected
    return {
        success: false,
        message: 'Failed to load dropdown data',
        data: {
            MI_Id: MI_Id,
            groupTypedropdownlist: [],
            departmentdropdownlist: [],
            designationdropdownlist: [],
            monthdropdown: [],
            leaveyeardropdown: []
        }
    };
}

/**
 * Get cumulative salary report data with pagination, search, and sort
 * TODO: Replace this with the actual search endpoint once provided
 * This is a placeholder that will be updated when the search endpoint is available
 */
export async function getCumulativeSalaryReportList(
    searchParams?: ApiSearchparams,
    filterParams?: {
        MIID?: number;
        LoginUserId?: number;
        UserRole?: string;
        is_export?: boolean;
        // Filter parameters for salary report
        month?: string;
        year?: string;
        groupTypeIdList?: number[];
        hrmD_IdList?: number[];
        hrmdeS_IdList?: number[];
    }
): Promise<ApiResponse<CumulativeSalaryReportListResponse>> {
    // TODO: Replace this URL with the actual search endpoint
    const url = '/api/CumulativeSalaryReportFacade/search'; // PLACEHOLDER - update when search endpoint is provided
    
    // Build request body with pagination, search, sort, and filter params
    const requestBody: any = {
        page: searchParams?.page || 1,
        page_size: searchParams?.page_size || 10,
        search_query: searchParams?.search_query || '',
        search_column: searchParams?.search_column || '',
        sort_column: searchParams?.sort_column || '',
        sort_direction: searchParams?.sort_direction || '',
        is_export: filterParams?.is_export || false,
        MIID: filterParams?.MIID || 30,
        LoginUserId: filterParams?.LoginUserId || 0,
        UserRole: filterParams?.UserRole || ''
    };
    
    // Add filter parameters
    if (filterParams?.month) {
        requestBody.month = filterParams.month;
    }
    if (filterParams?.year) {
        requestBody.year = filterParams.year;
    }
    if (filterParams?.groupTypeIdList && filterParams.groupTypeIdList.length > 0) {
        requestBody.groupTypeIdList = filterParams.groupTypeIdList;
    }
    if (filterParams?.hrmD_IdList && filterParams.hrmD_IdList.length > 0) {
        requestBody.hrmD_IdList = filterParams.hrmD_IdList;
    }
    if (filterParams?.hrmdeS_IdList && filterParams.hrmdeS_IdList.length > 0) {
        requestBody.hrmdeS_IdList = filterParams.hrmdeS_IdList;
    }
    
    // TODO: Uncomment and update when search endpoint is available
    // const response = await api.post<CumulativeSalaryReportListResponse>('hrms', url, requestBody);
    
    // For now, return empty response until search endpoint is provided
    
    return {
        success: false,
        message: 'Search endpoint not yet configured. Please provide the search endpoint URL.',
        data: {
            data: {
                dropdown: {
                    MI_Id: filterParams?.MIID || 30,
                    groupTypedropdownlist: [],
                    departmentdropdownlist: [],
                    designationdropdownlist: [],
                    monthdropdown: [],
                    leaveyeardropdown: []
                },
                rows: []
            },
            total: 0,
            page: searchParams?.page || 1,
            page_size: searchParams?.page_size || 10
        }
    };
}

// Legacy function for backward compatibility
export async function searchCumulativeSalaryReport(data: any): Promise<ApiResponse<any>> {
    // This is kept for backward compatibility but should use getCumulativeSalaryReportList instead
    // TODO: Update this to use the actual search endpoint when available
    return getCumulativeSalaryReportList();
}
