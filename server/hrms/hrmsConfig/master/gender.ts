'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { MasterGenderInput, MasterGenderResponse } from '@/types/hrms/master-gender';

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
 * Get onload details for master gender with search, sort, and pagination
 * POST /api/MasterGenderFacade/onloadgetdetails
 */
export async function getMasterGenderList(roleId: number, searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>) {
    const url = '/api/MasterGenderFacade/onloadgetdetails';
    
    // Normalize searchParams (convert strings to proper types)
    const normalizedParams = normalizeSearchParams(searchParams);
    
    // Extract pagination, search, and sort parameters
    const page = normalizedParams.page || 1;
    const page_size = normalizedParams.page_size || 10;
    const search_query = normalizedParams.search_query || '';
    
    // Define searchable columns
    // These are the columns that can be searched when search_query is provided
    const searchableColumns = 'IVRMMG_GenderName';
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
        const response = await api.post<MasterGenderResponse>('hrms', url, requestBody);
        
        // Transform response to match expected structure
        // The API returns data array directly, not wrapped in genderList
        const genderList = Array.isArray(response?.data) ? response.data : ((response as any)?.genderList || []);
        
        // Use API's total if provided, otherwise use array length
        const total = response?.total ?? (Array.isArray(genderList) ? genderList.length : 0);
        
        // Return in the expected format
        return {
            ...response,
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: genderList,
            total: total,
            page: response?.page ?? page,
            page_size: response?.page_size ?? page_size
        } as MasterGenderResponse;
    } catch (error: any) {
        console.error('🔴 [DEBUG] getMasterGenderList - Error Details:');
        console.error('🔴 [DEBUG] Error Message:', error?.message);
        console.error('🔴 [DEBUG] Error Response Status:', error?.response?.status);
        console.error('🔴 [DEBUG] Error Response Data:', JSON.stringify(error?.response?.data, null, 2));
        throw error;
    }
}

export async function saveMasterGender(data: MasterGenderInput) {
    const isEdit = data.IVRMMG_Id && data.IVRMMG_Id > 0;
    const url = '/api/MasterGenderFacade'; // Use same endpoint for both add and edit
    
    console.log('🟠 [API] saveMasterGender called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    console.log('🟠 [API] URL:', url);
    
    const currentDate = new Date().toISOString();
    
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        IVRMMG_Id: data.IVRMMG_Id || 0,
        MI_Id: data.MI_Id || 30,
        IVRMMG_GenderName: data.IVRMMG_GenderName,
        IVRMMG_ActiveFlag: data.IVRMMG_ActiveFlag,
        genderList: [
            {
                CreatedDate: currentDate,
                UpdatedDate: currentDate,
                IVRMMG_Id: data.IVRMMG_Id || 0,
                MI_Id: data.MI_Id || 30,
                IVRMMG_GenderName: data.IVRMMG_GenderName,
                IVRMMG_ActiveFlag: data.IVRMMG_ActiveFlag
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30
    };
    
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterGenderResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.success:', response?.success);
        console.log('🟢 [API] Response.message:', response?.message);
        console.log('🟢 [API] Response.data:', response?.data);
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🟢 [API] Response.IVRMMG_Id:', (response as any)?.IVRMMG_Id);
        
        // Handle the response format
        const responseData = response as any;
        // Check retrunMsg in both top level and nested data
        const retrunMsg = responseData?.retrunMsg || (responseData?.data as any)?.retrunMsg || '';
        const genderId = responseData?.IVRMMG_Id || (responseData?.data as any)?.IVRMMG_Id || 0;
        const hasGenderList = !!(responseData?.genderList || responseData?.data?.genderList);
        
        console.log('🟢 [API] Parsed - genderId:', genderId, 'retrunMsg:', retrunMsg, 'hasGenderList:', hasGenderList);
        console.log('🟢 [API] Full responseData.retrunMsg:', responseData?.retrunMsg);
        console.log('🟢 [API] Full responseData.data.retrunMsg:', (responseData?.data as any)?.retrunMsg);
        
        // Check for duplicate FIRST (this takes precedence over everything else)
        const isDuplicate = retrunMsg === 'Duplicate' || (retrunMsg && retrunMsg.toLowerCase().includes('duplicate'));
        
        console.log('🟢 [API] Duplicate check - retrunMsg:', retrunMsg, 'isDuplicate:', isDuplicate);
        
        // If duplicate, immediately return error (don't check for success)
        if (isDuplicate) {
            console.log('❌ [API] Duplicate detected - returning error response');
            return {
                success: false,
                message: 'Gender with this name already exists',
                data: responseData
            };
        }
        
        // Check if "Update" or "Saved" message indicates success
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add';
        
        // Success if we have a gender ID, genderList, or success message
        const isSuccess = genderId > 0 || hasGenderList || isUpdateSuccess;
        
        console.log('🟢 [API] isSuccess:', isSuccess);
        
        let message = 'Failed to save gender';
        if (isSuccess) {
            message = isEdit ? 'Gender updated successfully' : 'Gender added successfully';
        } else {
            message = retrunMsg || 'Failed to save gender';
        }
        
        const formattedResponse = {
            success: isSuccess,
            message: message,
            data: responseData
        };
        
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [API] Error occurred in api.post');
        console.error('🔴 [API] Error:', error);
        console.error('🔴 [API] Error message:', error?.message);
        console.error('🔴 [API] Error response:', error?.response);
        console.error('🔴 [API] Error response data:', error?.response?.data);
        throw error;
    }
}

/**
 * Activate or Deactivate a master gender record
 * POST /api/MasterGenderFacade/deactivateRecordById
 */
export async function activateDeactivateMasterGender(data: {
    IVRMMG_Id: number;
    IVRMMG_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterGenderFacade/deactivateRecordById';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        IVRMMG_Id: data.IVRMMG_Id,
        MI_Id: 30,
        IVRMMG_GenderName: 'string',
        IVRMMG_ActiveFlag: data.IVRMMG_ActiveFlag,
        genderList: [],
        retrunMsg: 'string',
        roleId: 0
    };
    return await api.post<MasterGenderResponse>('hrms', url, requestBody);
}
