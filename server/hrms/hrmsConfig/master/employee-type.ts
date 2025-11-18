'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    MasterEmployeeTypeInput,
    MasterEmployeeTypeResponse,
    SaveEmployeeTypeRequest
} from '@/types/hrms/master-employee-type';

/**
 * Helper function to convert searchParams from URL (strings) to proper types
 */
function normalizeSearchParams(searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>): ApiSearchparams {
    if (!searchParams) return {};
    
    // Helper to get first value if array, or the value itself
    const getValue = (value: string | string[] | number | undefined, defaultValue: string | number): string | number => {
        if (value === undefined) return defaultValue;
        if (typeof value === 'number') return value;
        if (Array.isArray(value)) return value[0] || defaultValue;
        return value;
    };
    
    return {
        page: typeof getValue(searchParams.page, 1) === 'string' ? parseInt(getValue(searchParams.page, 1) as string, 10) || 1 : (getValue(searchParams.page, 1) as number) || 1,
        page_size: typeof getValue(searchParams.page_size, 10) === 'string' ? parseInt(getValue(searchParams.page_size, 10) as string, 10) || 10 : (getValue(searchParams.page_size, 10) as number) || 10,
        search_query: (getValue(searchParams.search_query, '') as string) || '',
        search_column: (getValue(searchParams.search_column, '') as string) || '',
        sort_column: (getValue(searchParams.sort_column, '') as string) || '',
        sort_direction: (getValue(searchParams.sort_direction, '') as string) || ''
    };
}

/**
 * Get onload details for master employee type with search, sort, and pagination
 * POST /api/MasterEmployeeTypeFacade/onloadgetdetails
 */
export async function getMasterEmployeeTypeList(roleId: number = 0, searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>) {
    const url = '/api/MasterEmployeeTypeFacade/onloadgetdetails';
    
    // Normalize searchParams (convert strings to proper types)
    const normalizedParams = normalizeSearchParams(searchParams);
    
    // Extract pagination, search, and sort parameters
    const page = normalizedParams.page || 1;
    const page_size = normalizedParams.page_size || 10;
    const search_query = normalizedParams.search_query || '';
    
    // Define searchable columns
    // These are the columns that can be searched when search_query is provided
    const searchableColumns = 'HRMET_EmployeeType';
    const search_column = normalizedParams.search_column || (search_query ? searchableColumns : '');
    
    // If sort_column is provided but sort_direction is empty, default to 'asc'
    // The API requires sort_direction to be 'asc' or 'desc' when sort_column is provided
    const sort_column = normalizedParams.sort_column || '';
    const sort_direction = sort_column && !normalizedParams.sort_direction 
        ? 'asc' 
        : (normalizedParams.sort_direction || '');
    
    const requestBody = {
        page,
        page_size,
        search_query,
        search_column,
        sort_column,
        sort_direction,
        is_export: false,
        MIID: 30,
        LoginUserId: 0,
        UserRole: ''
    };
    
    try {
        const response = await api.post<MasterEmployeeTypeResponse>('hrms', url, requestBody);
        
        // Transform response to match expected structure
        // The API returns data array directly, or in employeeTypeList for backward compatibility
        const employeeTypeList = Array.isArray(response?.data) 
            ? response.data 
            : (response?.employeeTypeList || (response as any)?.data?.employeeTypeList || []);
        
        // Use API's total if provided, otherwise use array length
        const total = response?.total ?? (Array.isArray(employeeTypeList) ? employeeTypeList.length : 0);
        
        // Return in the expected format
        return {
            ...response,
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: employeeTypeList,
            employeeTypeList: employeeTypeList,
            total: total,
            page: response?.page ?? page,
            page_size: response?.page_size ?? page_size
        } as MasterEmployeeTypeResponse;
    } catch (error: any) {
        console.error('🔴 [DEBUG] getMasterEmployeeTypeList - Error Details:');
        console.error('🔴 [DEBUG] Error Message:', error?.message);
        console.error('🔴 [DEBUG] Error Response Status:', error?.response?.status);
        console.error('🔴 [DEBUG] Error Response Data:', JSON.stringify(error?.response?.data, null, 2));
        throw error;
    }
}

export async function saveMasterEmployeeType(data: MasterEmployeeTypeInput) {
    const isEdit = data.HRMET_Id && data.HRMET_Id > 0;
    const url = '/api/MasterEmployeeTypeFacade';
    
    console.log('🟠 [API] saveMasterEmployeeType called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    
    const now = new Date().toISOString();
    const requestBody: SaveEmployeeTypeRequest = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMET_Id: data.HRMET_Id || 0,
        MI_Id: data.MI_Id ?? 30,
        HRMET_EmployeeType: data.HRMET_EmployeeType,
        HRMET_ActiveFlag: data.HRMET_ActiveFlag,
        employeeTypeList: [
            {
                CreatedDate: now,
                UpdatedDate: now,
                HRMET_Id: data.HRMET_Id || 0,
                MI_Id: data.MI_Id ?? 30,
                HRMET_EmployeeType: data.HRMET_EmployeeType,
                HRMET_ActiveFlag: data.HRMET_ActiveFlag
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id ?? 30
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterEmployeeTypeResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        
        const responseData = response as any;
        
        // Check for response structure: { success: true, message: "Add", data: { retrunMsg: "Add", ... } }
        // or direct structure: { retrunMsg: "Add", HRMET_Id: ..., ... }
        const topLevelSuccess = responseData?.success === true;
        const topLevelMessage = responseData?.message || '';
        const nestedData = responseData?.data || responseData;
        
        const retrunMsg = nestedData?.retrunMsg || responseData?.retrunMsg || topLevelMessage || '';
        const savedId = nestedData?.HRMET_Id || responseData?.HRMET_Id || 0;
        const hasEmployeeTypeList = !!(nestedData?.employeeTypeList?.length > 0 || responseData?.employeeTypeList?.length > 0);
        
        // Check for success indicators - "Add", "Order" are also success messages!
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add' || retrunMsg === 'Order';
        const isDuplicateError = retrunMsg === 'Duplicate';
        
        // If top level success is true, trust it; otherwise check other indicators
        const isSuccess = topLevelSuccess || ((savedId > 0 || isUpdateSuccess || hasEmployeeTypeList) && !isDuplicateError);
        
        console.log('🟢 [API] Parsed - topLevelSuccess:', topLevelSuccess, 'topLevelMessage:', topLevelMessage);
        console.log('🟢 [API] Parsed - savedId:', savedId, 'retrunMsg:', retrunMsg, 'hasEmployeeTypeList:', hasEmployeeTypeList);
        console.log('🟢 [API] isSuccess:', isSuccess, 'isDuplicate:', isDuplicateError);
        
        const formattedResponse = {
            success: isSuccess,
            message: isDuplicateError 
                ? 'Employee type already exists'
                : isSuccess 
                    ? (topLevelMessage || (isEdit ? 'Employee type updated successfully' : 'Employee type added successfully'))
                    : (retrunMsg || 'Failed to save employee type'),
            data: nestedData || responseData
        };
        
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [API] Error occurred');
        console.error('🔴 [API] Error:', error);
        throw error;
    }
}

export async function activateDeactivateMasterEmployeeType(data: {
    HRMET_Id: number;
    HRMET_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterEmployeeTypeFacade/deactivateRecordById';
    const now = new Date().toISOString();
    const requestBody: SaveEmployeeTypeRequest = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMET_Id: data.HRMET_Id,
        MI_Id: data.MI_Id ?? 30,
        HRMET_EmployeeType: 'string',
        HRMET_ActiveFlag: data.HRMET_ActiveFlag,
        employeeTypeList: [
            {
                CreatedDate: now,
                UpdatedDate: now,
                HRMET_Id: data.HRMET_Id,
                MI_Id: data.MI_Id ?? 30,
                HRMET_EmployeeType: 'string',
                HRMET_ActiveFlag: data.HRMET_ActiveFlag
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id ?? 30
    };
    return await api.post<MasterEmployeeTypeResponse>('hrms', url, requestBody);
}
