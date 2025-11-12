'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    MasterEmployeeTypeInput,
    MasterEmployeeTypeResponse,
    OnloadGetEmployeeTypeDetailsRequest,
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
 * Get all master employee type records with search, sort, and pagination
 * POST /api/MasterEmployeeTypeFacade/onloadgetdetails
 */
export async function getMasterEmployeeTypeList(roleId = 0, searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>) {
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
        UserRole: '',
        // Required fields by API model (even for list operations)
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMET_Id: 0,
        MI_Id: 30,
        HRMET_EmployeeType: 'string',
        HRMET_ActiveFlag: true,
        employeeTypeList: [],
        retrunMsg: 'string',
        roleId: roleId
    };
    
    // Debug logging
    console.log('🔵 [DEBUG] getMasterEmployeeTypeList - Request Details:');
    console.log('🔵 [DEBUG] Method: POST');
    console.log('🔵 [DEBUG] URL:', url);
    console.log('🔵 [DEBUG] Base URL Key: hrms');
    console.log('🔵 [DEBUG] roleId:', roleId);
    console.log('🔵 [DEBUG] Raw searchParams:', JSON.stringify(searchParams, null, 2));
    console.log('🔵 [DEBUG] Normalized searchParams:', JSON.stringify(normalizedParams, null, 2));
    console.log('🔵 [DEBUG] Search Configuration:');
    console.log('🔵 [DEBUG] - search_query:', search_query);
    console.log('🔵 [DEBUG] - search_column:', search_column);
    console.log('🔵 [DEBUG] - searchableColumns:', searchableColumns);
    console.log('🔵 [DEBUG] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🔵 [DEBUG] Request Body Types:', {
        page: typeof page,
        page_size: typeof page_size,
        search_query: typeof search_query,
        search_column: typeof search_column,
        sort_column: typeof sort_column,
        sort_direction: typeof sort_direction,
        is_export: typeof false,
        MIID: typeof 30,
        LoginUserId: typeof 0,
        UserRole: typeof ''
    });
    
    try {
        console.log('🔵 [DEBUG] Calling api.post with:', { baseUrlKey: 'hrms', url, requestBody });
        const response = await api.post<MasterEmployeeTypeResponse>('hrms', url, requestBody);
        
        // Debug the response structure
        console.log('🟢 [DEBUG] getMasterEmployeeTypeList - Full Response:', JSON.stringify(response, null, 2));
        console.log('🟢 [DEBUG] getMasterEmployeeTypeList - Response Success:', response?.success);
        console.log('🟢 [DEBUG] getMasterEmployeeTypeList - Response Message:', response?.message);
        console.log('🟢 [DEBUG] getMasterEmployeeTypeList - Response Keys:', Object.keys(response || {}));
        console.log('🟢 [DEBUG] getMasterEmployeeTypeList - Response Data Type:', Array.isArray(response?.data) ? 'Array' : typeof response?.data);
        console.log('🟢 [DEBUG] getMasterEmployeeTypeList - Response Data:', response?.data);
        console.log('🟢 [DEBUG] getMasterEmployeeTypeList - Response employeeTypeList:', (response as any)?.employeeTypeList);
        console.log('🟢 [DEBUG] getMasterEmployeeTypeList - Response Total:', response?.total);
        console.log('🟢 [DEBUG] getMasterEmployeeTypeList - Response Page:', response?.page);
        console.log('🟢 [DEBUG] getMasterEmployeeTypeList - Response Page Size:', response?.page_size);
        
        // Transform response to match expected structure (like preadmission and bank)
        // The API returns data directly as an array in the response.data field, or nested in employeeTypeList
        // Based on the API response structure: { success, message, data: [...], total, page, page_size }
        const employeeTypeList = Array.isArray(response?.data) 
            ? response.data 
            : (response as any)?.employeeTypeList || (response as any)?.data?.employeeTypeList || [];
        
        console.log('🟢 [DEBUG] getMasterEmployeeTypeList - Extracted employeeTypeList:');
        console.log('🟢 [DEBUG] - Is Array:', Array.isArray(employeeTypeList));
        console.log('🟢 [DEBUG] - Length:', employeeTypeList.length);
        console.log('🟢 [DEBUG] - First 3 items:', employeeTypeList.slice(0, 3));
        
        // Use API's total if provided, otherwise use array length
        // Note: If API is paginating correctly, it should return total count of ALL records, not just this page
        const total = response?.total ?? (Array.isArray(employeeTypeList) ? employeeTypeList.length : 0);
        
        console.log('🟢 [DEBUG] getMasterEmployeeTypeList - Transformed Response:');
        console.log('🟢 [DEBUG] - data (employeeTypeList) length:', employeeTypeList.length);
        console.log('🟢 [DEBUG] - total:', total);
        console.log('🟢 [DEBUG] - page:', response?.page ?? page);
        console.log('🟢 [DEBUG] - page_size:', response?.page_size ?? page_size);
        
        // Return in the expected format - spread response first, then override with transformed values
        const transformedResponse = {
            ...response,
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: employeeTypeList, // Return all items from API - let API handle pagination
            total: total,
            page: response?.page ?? page,
            page_size: response?.page_size ?? page_size
        } as MasterEmployeeTypeResponse;
        
        console.log('🟢 [DEBUG] getMasterEmployeeTypeList - Final Transformed Response:');
        console.log('🟢 [DEBUG] - success:', transformedResponse.success);
        console.log('🟢 [DEBUG] - message:', transformedResponse.message);
        console.log('🟢 [DEBUG] - data length:', Array.isArray(transformedResponse.data) ? transformedResponse.data.length : 'Not an array');
        console.log('🟢 [DEBUG] - total:', transformedResponse.total);
        console.log('🟢 [DEBUG] - page:', transformedResponse.page);
        console.log('🟢 [DEBUG] - page_size:', transformedResponse.page_size);
        
        return transformedResponse;
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
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🟢 [API] Response.HRMET_Id:', (response as any)?.HRMET_Id);
        
        // Handle the response format
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        const savedId = responseData?.HRMET_Id || 0;
        const hasEmployeeTypeList = !!(responseData?.employeeTypeList?.length > 0);
        
        // Check for success indicators - "Add", "Order" are also success messages!
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add' || retrunMsg === 'Order';
        const isDuplicateError = retrunMsg === 'Duplicate';
        const isSuccess = (savedId > 0 || isUpdateSuccess || hasEmployeeTypeList) && !isDuplicateError;
        
        console.log('🟢 [API] Parsed - savedId:', savedId, 'retrunMsg:', retrunMsg, 'hasEmployeeTypeList:', hasEmployeeTypeList);
        console.log('🟢 [API] isSuccess:', isSuccess, 'isDuplicate:', isDuplicateError);
        
        const formattedResponse = {
            success: isSuccess,
            message: isDuplicateError 
                ? 'Employee type already exists'
                : isSuccess 
                    ? (isEdit ? 'Employee type updated successfully' : 'Employee type added successfully')
                    : (retrunMsg || 'Failed to save employee type'),
            data: responseData
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
