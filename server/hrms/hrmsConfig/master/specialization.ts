'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { MasterSpecializationInput, MasterSpecializationResponse } from '@/types/hrms/master-specialization';

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
 * Get all master specialization records with search, sort, and pagination
 * POST /api/MasterSpecialisationFacade/loaddata
 */
export async function getMasterSpecializationList(roleId: number, searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>) {
    const url = '/api/MasterSpecialisationFacade/loaddata';
    
    // Normalize searchParams (convert strings to proper types)
    const normalizedParams = normalizeSearchParams(searchParams);
    
    // Extract pagination, search, and sort parameters
    const page = normalizedParams.page || 1;
    const page_size = normalizedParams.page_size || 10;
    const search_query = normalizedParams.search_query || '';
    
    // Define searchable columns
    // These are the columns that can be searched when search_query is provided
    const searchableColumns = 'HRMSPL_SpecialisationName';
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
        const response = await api.post<any>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        
        // Response structure from API:
        // {
        //   "success": true,
        //   "message": "Data fetched successfully",
        //   "data": [ ... array of specialization items ... ],
        //   "total": 8,
        //   "page": 1,
        //   "page_size": 10
        // }
        
        // The API returns data as an array directly
        const specializationList = Array.isArray(response?.data) 
            ? response.data 
            : [];
        
        // Use API's total if provided, otherwise use array length
        const total = response?.total ?? specializationList.length;
        
        console.log('🟢 [API] Response parsing:');
        console.log('🟢 [API] - success:', response?.success);
        console.log('🟢 [API] - message:', response?.message);
        console.log('🟢 [API] - data array length:', specializationList.length);
        console.log('🟢 [API] - total:', total);
        console.log('🟢 [API] - page:', response?.page);
        console.log('🟢 [API] - page_size:', response?.page_size);
        
        // Return in the expected format matching the API response structure
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: specializationList,
            total: total,
            page: response?.page ?? page,
            page_size: response?.page_size ?? page_size
        } as MasterSpecializationResponse;
    } catch (error: any) {
        console.error('🔴 [DEBUG] getMasterSpecializationList - Error Details:');
        console.error('🔴 [DEBUG] Error Message:', error?.message);
        console.error('🔴 [DEBUG] Error Response Status:', error?.response?.status);
        console.error('🔴 [DEBUG] Error Response Data:', JSON.stringify(error?.response?.data, null, 2));
        throw error;
    }
}

/**
 * Create or Update master specialization item
 * POST /api/MasterSpecialisationFacade/SaveData (for both create and update)
 */
export async function saveMasterSpecialization(data: MasterSpecializationInput) {
    const isEdit = data.HRMSPL_Id && data.HRMSPL_Id > 0;
    const url = '/api/MasterSpecialisationFacade/SaveData'; // Use same endpoint for both add and edit
    
    console.log('🟠 [API] saveMasterSpecialization called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    console.log('🟠 [API] URL:', url);
    
    const now = new Date().toISOString();
    
    // Create the item object for alldata and editlist arrays
    const itemData = {
        HRMSPL_Id: data.HRMSPL_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRMSPL_SpecialisationName: data.HRMSPL_SpecialisationName,
        HRMSPL_ActiveFlg: data.HRMSPL_ActiveFlg,
        HRMSPL_CreatedBy: 0,
        HRMSPL_UpdatedBy: 0,
        HRMSPL_CreatedDate: now,
        HRMSPL_UpdatedDate: now
    };
    
    // Build request body matching Swagger API structure
    const requestBody = {
        HRMSPL_Id: data.HRMSPL_Id || 0,
        MI_Id: data.MI_Id || 30,
        UserId: 0,
        HRMSPL_SpecialisationName: data.HRMSPL_SpecialisationName,
        HRMSPL_ActiveFlg: data.HRMSPL_ActiveFlg,
        HRMSPL_CreatedBy: 0,
        HRMSPL_UpdatedBy: 0,
        HRMSPL_CreatedDate: now,
        HRMSPL_UpdatedDate: now,
        alldata: [itemData],
        editlist: [itemData],
        duplicate: false,
        msg: '',
        returnval: true
    };
    
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<any>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        
        // Response structure from Swagger:
        // {
        //   "success": true,
        //   "message": "Saved",
        //   "data": { ... },
        //   "total": null,
        //   "page": null,
        //   "page_size": null
        // }
        
        // Extract response data
        const responseData = response?.data || response;
        const success = response?.success ?? false;
        const message = response?.message || responseData?.msg || '';
        
        // Check for error messages (even if success is true, error message means failure)
        const messageLower = message.toLowerCase();
        const hasError = messageLower.includes('error') || 
                        messageLower.includes('failed') ||
                        messageLower.includes('exception') ||
                        messageLower.includes('duplicate');
        
        // Check if the operation was successful
        // Success indicators:
        // 1. No error message
        // 2. response.success === true
        // 3. response.data.returnval === true (if present)
        // 4. response.data.HRMSPL_Id > 0 (for edit mode)
        const returnval = responseData?.returnval ?? false;
        const duplicate = responseData?.duplicate ?? false;
        const hasValidId = responseData?.HRMSPL_Id && responseData.HRMSPL_Id > 0;
        const hasSuccessMessage = message && !hasError && (
            messageLower.includes('saved') ||
            messageLower.includes('successfully') ||
            messageLower.includes('added') ||
            messageLower.includes('updated')
        );
        
        // Success only if no error AND (success flag OR returnval OR has success message)
        // But NOT if duplicate is true
        const isSuccess = !hasError && !duplicate && (success || returnval || hasSuccessMessage);
        
        console.log('🟢 [API] Response parsing:');
        console.log('🟢 [API] - success:', success);
        console.log('🟢 [API] - message:', message);
        console.log('🟢 [API] - hasError:', hasError);
        console.log('🟢 [API] - duplicate:', duplicate);
        console.log('🟢 [API] - returnval:', returnval);
        console.log('🟢 [API] - hasValidId:', hasValidId, '(HRMSPL_Id:', responseData?.HRMSPL_Id, ')');
        console.log('🟢 [API] - hasSuccessMessage:', hasSuccessMessage);
        console.log('🟢 [API] - Final isSuccess:', isSuccess);
        
        // Determine the message to return - prioritize API message
        let finalMessage = message;
        if (!finalMessage) {
            if (duplicate) {
                finalMessage = 'Specialization already exists';
            } else if (isSuccess) {
                finalMessage = isEdit ? 'Specialization updated successfully' : 'Specialization added successfully';
            } else {
                finalMessage = 'Failed to save specialization';
            }
        }
        
        // Return response matching Swagger structure
        return {
            success: isSuccess,
            message: finalMessage,
            data: responseData,
            total: response?.total ?? null,
            page: response?.page ?? null,
            page_size: response?.page_size ?? null
        };
    } catch (error: any) {
        console.log('🔴 [API] Error occurred in api.post');
        console.error('🔴 [API] Error:', error);
        console.error('🔴 [API] Error message:', error?.message);
        console.error('🔴 [API] Error response:', error?.response);
        console.error('🔴 [API] Error response data:', error?.response?.data);
        
        // Extract error message from response if available
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.msg ||
                           error?.message || 
                           'Failed to save specialization';
        
        return {
            success: false,
            message: errorMessage,
            data: null,
            total: null,
            page: null,
            page_size: null
        };
    }
}

/**
 * Get details of a specific master specialization by ID for editing
 * POST /api/MasterSpecialisationFacade/EditData
 */
export async function getMasterSpecializationDetails(id: number, miId: number = 30) {
    const url = '/api/MasterSpecialisationFacade/EditData';
    
    const requestBody = {
        HRMSPL_Id: id,
        MI_Id: miId
    };
    
    console.log('🟠 [API] getMasterSpecializationDetails called');
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    
    try {
        const response = await api.post<MasterSpecializationResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        
        // Transform response to match expected structure
        // The API may return data in different formats
        const responseData = response as any;
        const nestedData = responseData?.data || responseData;
        
        // Extract specialization item from alldata or editlist if available
        const specializationList = Array.isArray(nestedData?.alldata) 
            ? nestedData.alldata 
            : Array.isArray(nestedData?.editlist)
            ? nestedData.editlist
            : Array.isArray(response?.data)
            ? response.data
            : nestedData?.HRMSPL_Id 
            ? [nestedData]
            : [];
        
        // Return in the expected format
        return {
            ...response,
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: specializationList.length > 0 ? specializationList[0] : null,
            alldata: specializationList
        } as any;
    } catch (error: any) {
        console.error('🔴 [DEBUG] getMasterSpecializationDetails - Error Details:');
        console.error('🔴 [DEBUG] Error Message:', error?.message);
        console.error('🔴 [DEBUG] Error Response Status:', error?.response?.status);
        console.error('🔴 [DEBUG] Error Response Data:', JSON.stringify(error?.response?.data, null, 2));
        throw error;
    }
}

/**
 * Activate or Deactivate a master specialization record
 * POST /api/MasterSpecialisationFacade/DecativeData
 */
export async function activateDeactivateMasterSpecialization(data: {
    HRMSPL_Id: number;
    HRMSPL_ActiveFlg: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterSpecialisationFacade/DecativeData';
    
    console.log('🟠 [API] activateDeactivateMasterSpecialization called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Action:', data.HRMSPL_ActiveFlg ? 'Activate' : 'Deactivate');
    console.log('🟠 [API] URL:', url);
    
    // Request body only needs HRMSPL_Id
    const requestBody = {
        HRMSPL_Id: data.HRMSPL_Id
    };
    
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<any>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        
        // Extract response data
        const responseData = response?.data || response;
        const success = response?.success ?? false;
        const message = response?.message || responseData?.msg || '';
        
        // Check for error messages (even if success is true, error message means failure)
        const messageLower = message.toLowerCase();
        const hasError = messageLower.includes('error') || 
                        messageLower.includes('failed') ||
                        messageLower.includes('exception');
        
        // Check if the operation was successful
        // Success indicators:
        // 1. No error message
        // 2. response.success === true
        // 3. response.data.returnval === true (if present)
        const returnval = responseData?.returnval ?? false;
        const duplicate = responseData?.duplicate ?? false;
        const hasSuccessMessage = message && !hasError && (
            messageLower.includes('successfully') ||
            messageLower.includes('activated') ||
            messageLower.includes('deactivated') ||
            messageLower.includes('saved') ||
            messageLower.includes('updated')
        );
        
        // Success only if no error AND (success flag OR returnval OR has success message)
        // But NOT if duplicate is true
        const isSuccess = !hasError && !duplicate && (success || returnval || hasSuccessMessage);
        
        console.log('🟢 [API] Response parsing:');
        console.log('🟢 [API] - success:', success);
        console.log('🟢 [API] - message:', message);
        console.log('🟢 [API] - hasError:', hasError);
        console.log('🟢 [API] - duplicate:', duplicate);
        console.log('🟢 [API] - returnval:', returnval);
        console.log('🟢 [API] - hasSuccessMessage:', hasSuccessMessage);
        console.log('🟢 [API] - Final isSuccess:', isSuccess);
        
        // Determine the message to return - prioritize API message
        let finalMessage = message;
        if (!finalMessage) {
            if (duplicate) {
                finalMessage = 'Specialization already exists';
            } else if (isSuccess) {
                finalMessage = `Specialization ${data.HRMSPL_ActiveFlg ? 'activated' : 'deactivated'} successfully`;
            } else {
                finalMessage = `Failed to ${data.HRMSPL_ActiveFlg ? 'activate' : 'deactivate'} specialization`;
            }
        }
        
        // Return response matching Swagger structure
        return {
            success: isSuccess,
            message: finalMessage,
            data: responseData,
            total: response?.total ?? null,
            page: response?.page ?? null,
            page_size: response?.page_size ?? null
        };
    } catch (error: any) {
        console.log('🔴 [API] Error occurred in api.post');
        console.error('🔴 [API] Error:', error);
        console.error('🔴 [API] Error message:', error?.message);
        console.error('🔴 [API] Error response:', error?.response);
        console.error('🔴 [API] Error response data:', error?.response?.data);
        
        // Extract error message from response if available
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.msg ||
                           error?.message || 
                           `Failed to ${data.HRMSPL_ActiveFlg ? 'activate' : 'deactivate'} specialization`;
        
        return {
            success: false,
            message: errorMessage,
            data: null,
            total: null,
            page: null,
            page_size: null
        };
    }
}
