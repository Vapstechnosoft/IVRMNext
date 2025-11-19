'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { ReligionCategoryMappingInput, ReligionCategoryMappingResponse, ReligionCategoryMappingRequest, ReligionCategoryMappingDetail } from '@/types/hrms/religion-category-mapping';

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
 * Get onload details for religion category mapping with search, sort, and pagination
 * POST /api/ReligionCategory_MappingFacade/onloadgetdetails
 */
export async function getReligionCategoryMappingList(
    searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>,
    params?: {
        IRCC_Id?: number;
        IVRMMR_Id?: number;
        IMCC_Id?: number;
        UserId?: number;
    }
) {
    const url = '/api/ReligionCategory_MappingFacade/onloadgetdetails';
    
    // Normalize searchParams (convert strings to proper types)
    const normalizedParams = normalizeSearchParams(searchParams);
    
    // Extract pagination, search, and sort parameters
    const page = normalizedParams.page || 1;
    const page_size = normalizedParams.page_size || 10;
    const search_query = normalizedParams.search_query || '';
    
    // Define searchable columns
    // These are the columns that can be searched when search_query is provided
    const searchableColumns = 'IVRMMR_Name,IMCC_CategoryName';
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
        LoginUserId: params?.UserId ?? 0,
        UserRole: ''
    };
    
    try {
        const response = await api.post<ReligionCategoryMappingResponse>('hrms', url, requestBody);
        
        // Transform response to match expected structure
        // The API returns data array directly, or in get_masterlist for backward compatibility
        const get_masterlist = Array.isArray(response?.data) 
            ? response.data 
            : (response?.get_masterlist || (response as any)?.data?.get_masterlist || []);
        
        // Use API's total if provided, otherwise use array length
        const total = response?.total ?? (Array.isArray(get_masterlist) ? get_masterlist.length : 0);
        
        // Return in the expected format
        const transformedResponse: ReligionCategoryMappingResponse = {
            ...response,
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: get_masterlist,
            get_masterlist: get_masterlist,
            total: total,
            page: (typeof response?.page === 'number' ? response.page : page) || page,
            page_size: (typeof response?.page_size === 'number' ? response.page_size : page_size) || page_size
        };
        
        return {
            success: transformedResponse.success ?? true,
            message: transformedResponse.message || 'Data loaded successfully',
            data: transformedResponse
        } as ApiResponse<ReligionCategoryMappingResponse>;
    } catch (error: any) {
        console.error('🔴 [DEBUG] getReligionCategoryMappingList - Error Details:');
        console.error('🔴 [DEBUG] Error Message:', error?.message);
        console.error('🔴 [DEBUG] Error Response Status:', error?.response?.status);
        console.error('🔴 [DEBUG] Error Response Data:', JSON.stringify(error?.response?.data, null, 2));
        throw error;
    }
}

/**
 * Save or Update religion category mapping record
 * POST /api/ReligionCategory_MappingFacade/savedata (both create and update)
 */
export async function saveReligionCategoryMapping(data: ReligionCategoryMappingInput) {
    const url = '/api/ReligionCategory_MappingFacade/savedata';
    const isNewRecord = !data.IRCC_Id || data.IRCC_Id === 0;
    
    // Get the category IDs from categoryids array if available, otherwise use IMCC_Id
    const categoryIds = data.categoryids && Array.isArray(data.categoryids) && data.categoryids.length > 0 
        ? data.categoryids.filter((id): id is number => typeof id === 'number' && !isNaN(id) && id > 0)
        : (data.IMCC_Id && data.IMCC_Id > 0 ? [data.IMCC_Id] : []);
    
    // Validate that we have at least one category ID (for nested array)
    if (categoryIds.length === 0) {
        throw new Error('At least one valid category ID is required');
    }
    
    // Get the actual religion ID and category ID (first category for backward compatibility)
    const actualReligionId = data.IVRMMR_Id && data.IVRMMR_Id > 0 ? data.IVRMMR_Id : 0;
    const actualCategoryId = categoryIds[0];
    
    // Ensure IRCC_Id is properly set - it should be > 0 for updates to exclude from duplicate check
    const irccId = data.IRCC_Id && data.IRCC_Id > 0 ? data.IRCC_Id : 0;
    
    // Validate that we have valid IDs for the nested arrays
    if (actualReligionId === 0) {
        throw new Error('Religion ID is required and must be greater than 0');
    }
    
    // Root level values are always 0 (as per old project structure)
    // Actual IDs go in religion_list and caste_list arrays
    const requestBody: ReligionCategoryMappingRequest = {
        IRCC_Id: irccId,
        MI_Id: data.MI_Id || 30,
        UserId: data.UserId || 0,
        IVRMMR_Id: 0, // Root level is always 0 in old project
        IMCC_Id: 0, // Root level is always 0 in old project
        IRCC_ActiveFlg: data.IRCC_ActiveFlg ?? true,
        IRCC_CreatedBy: data.IRCC_CreatedBy || 0,
        IRCC_UpdatedBy: data.IRCC_UpdatedBy || 0,
        IRCC_CreatedDate: isNewRecord ? new Date().toISOString() : (data.IRCC_CreatedDate || new Date().toISOString()),
        IRCC_UpdatedDate: new Date().toISOString(),
        religion_list: [
            {
                CreatedDate: new Date().toISOString(),
                UpdatedDate: new Date().toISOString(),
                IVRMMR_Id: actualReligionId, // Actual religion ID goes here
                IVRMMR_Name: data.IVRMMR_Name || 'string',
                Is_Active: true
            }
        ],
        get_masterlist: [],
        caste_list: [
            {
                CreatedDate: new Date().toISOString(),
                UpdatedDate: new Date().toISOString(),
                IMCC_Id: actualCategoryId, // Actual category ID goes here (first category)
                IMCC_CategoryName: data.IMCC_CategoryName || 'string',
                IMCC_CategoryCode: data.IMCC_CategoryCode || 'string',
                IMCC_CategoryDesc: data.IMCC_CategoryDesc || 'string'
            }
        ],
        editlist: [],
        returnval: true, // Default to true as per old project
        castid: [], // Empty array as per old project (not used for saving)
        duplicate: true, // Default to true as per old project
        IVRMMR_Name: data.IVRMMR_Name || 'string',
        IMCC_CategoryName: data.IMCC_CategoryName || 'string',
        msg: '' // Empty string - backend will populate the actual message
    };
    
    const response = await api.post<ReligionCategoryMappingResponse>('hrms', url, requestBody);
    
    // Handle case where backend returns data directly in response.data with returnval/msg
    // Transform returnval/msg to success/message format
    // Note: Some APIs return returnval=false even on success, so we check msg content too
    if (response && typeof response === 'object') {
        // If response has data field with returnval, transform it
        if ('data' in response && response.data && typeof response.data === 'object' && 'returnval' in response.data) {
            const rawData = response.data as unknown as ReligionCategoryMappingResponse;
            let message = rawData.msg || '';
            
            // If message is empty or "string", provide a default success message
            if (!message || message.trim() === '' || message.toLowerCase() === 'string') {
                message = isNewRecord ? 'Mapping saved successfully' : 'Mapping updated successfully';
            }
            
            // Check if message indicates success (Saved, Updated, Edited, etc.)
            // Some APIs return returnval=false even on success, so prioritize message content
            const isSuccessMessage = message.toLowerCase().includes('saved') || 
                                   message.toLowerCase().includes('updated') || 
                                   message.toLowerCase().includes('edited') ||
                                   message.toLowerCase().includes('edited successfully') ||
                                   message.toLowerCase().includes('success');
            // Use returnval if true, otherwise trust the message
            const success = rawData.returnval === true || (rawData.returnval === false && isSuccessMessage);
            return {
                success: success,
                message: message,
                data: rawData
            } as ApiResponse<ReligionCategoryMappingResponse>;
        }
        
        // If response itself has returnval (direct response from axios)
        if ('returnval' in response) {
            const rawResponse = response as unknown as ReligionCategoryMappingResponse;
            let message = rawResponse.msg || '';
            
            // If message is empty or "string", provide a default success message
            if (!message || message.trim() === '' || message.toLowerCase() === 'string') {
                message = isNewRecord ? 'Mapping saved successfully' : 'Mapping updated successfully';
            }
            
            const isSuccessMessage = message.toLowerCase().includes('saved') || 
                                   message.toLowerCase().includes('updated') || 
                                   message.toLowerCase().includes('edited') ||
                                   message.toLowerCase().includes('edited successfully') ||
                                   message.toLowerCase().includes('success');
            // Use returnval if true, otherwise trust the message
            const success = rawResponse.returnval === true || (rawResponse.returnval === false && isSuccessMessage);
            return {
                success: success,
                message: message,
                data: rawResponse
            } as ApiResponse<ReligionCategoryMappingResponse>;
        }
        
        // If already in ApiResponse format
        if ('success' in response) {
            return response as ApiResponse<ReligionCategoryMappingResponse>;
        }
    }
    
    // Default fallback
    return {
        success: false,
        message: 'Unknown error occurred',
        data: response as unknown as ReligionCategoryMappingResponse
    } as ApiResponse<ReligionCategoryMappingResponse>;
}

/**
 * Activate/Deactivate religion category mapping
 * POST /api/ReligionCategory_MappingFacade/masterDecative
 */
export async function activateDeactivateReligionCategoryMapping(data: ReligionCategoryMappingDetail & { IRCC_ActiveFlg: boolean }) {
    const url = '/api/ReligionCategory_MappingFacade/masterDecative';
    
    // Structure matches old project: root level IDs are 0, nested arrays contain objects with 0 IDs
    const requestBody: ReligionCategoryMappingRequest = {
        IRCC_Id: data.IRCC_Id,
        MI_Id: data.MI_Id || 30,
        UserId: data.UserId || 0,
        IVRMMR_Id: 0, // Root level is always 0 in old project
        IMCC_Id: 0, // Root level is always 0 in old project
        IRCC_ActiveFlg: data.IRCC_ActiveFlg,
        IRCC_CreatedBy: data.IRCC_CreatedBy || 0,
        IRCC_UpdatedBy: data.IRCC_UpdatedBy || 0,
        IRCC_CreatedDate: data.IRCC_CreatedDate || new Date().toISOString(),
        IRCC_UpdatedDate: new Date().toISOString(),
        religion_list: [
            {
                CreatedDate: new Date().toISOString(),
                UpdatedDate: new Date().toISOString(),
                IVRMMR_Id: 0, // Always 0 in nested array for deactivate
                IVRMMR_Name: 'string',
                Is_Active: true
            }
        ],
        get_masterlist: [],
        caste_list: [
            {
                CreatedDate: new Date().toISOString(),
                UpdatedDate: new Date().toISOString(),
                IMCC_Id: 0, // Always 0 in nested array for deactivate
                IMCC_CategoryName: 'string',
                IMCC_CategoryCode: 'string',
                IMCC_CategoryDesc: 'string'
            }
        ],
        editlist: [],
        returnval: true, // Default to true as per old project
        castid: [], // Empty array as per old project
        duplicate: true, // Default to true as per old project
        IVRMMR_Name: 'string',
        IMCC_CategoryName: 'string',
        msg: '' // Empty string - backend will populate the actual message
    };
    
    const response = await api.post<ReligionCategoryMappingResponse>('hrms', url, requestBody);
    
    // Handle case where backend returns data directly in response.data with returnval/msg
    // Transform returnval/msg to success/message format
    // Note: Some APIs return returnval=false even on success, so we check msg content too
    if (response && typeof response === 'object') {
        // If response has data field with returnval, transform it
        if ('data' in response && response.data && typeof response.data === 'object' && 'returnval' in response.data) {
            const rawData = response.data as unknown as ReligionCategoryMappingResponse;
            let message = rawData.msg || '';
            
            // If message is empty or "string", provide a default success message
            if (!message || message.trim() === '' || message.toLowerCase() === 'string') {
                message = data.IRCC_ActiveFlg ? 'Mapping activated successfully' : 'Mapping deactivated successfully';
            }
            
            // Check if message indicates success (Activated, Deactivated, Updated, etc.)
            const isSuccessMessage = message.toLowerCase().includes('activated') || 
                                   message.toLowerCase().includes('deactivated') || 
                                   message.toLowerCase().includes('updated') ||
                                   message.toLowerCase().includes('success');
            // Use returnval if true, otherwise trust the message
            const success = rawData.returnval === true || (rawData.returnval === false && isSuccessMessage);
            return {
                success: success,
                message: message,
                data: rawData
            } as ApiResponse<ReligionCategoryMappingResponse>;
        }
        
        // If response itself has returnval (direct response from axios)
        if ('returnval' in response) {
            const rawResponse = response as unknown as ReligionCategoryMappingResponse;
            let message = rawResponse.msg || '';
            
            // If message is empty or "string", provide a default success message
            if (!message || message.trim() === '' || message.toLowerCase() === 'string') {
                message = data.IRCC_ActiveFlg ? 'Mapping activated successfully' : 'Mapping deactivated successfully';
            }
            
            const isSuccessMessage = message.toLowerCase().includes('activated') || 
                                   message.toLowerCase().includes('deactivated') || 
                                   message.toLowerCase().includes('updated') ||
                                   message.toLowerCase().includes('success');
            // Use returnval if true, otherwise trust the message
            const success = rawResponse.returnval === true || (rawResponse.returnval === false && isSuccessMessage);
            return {
                success: success,
                message: message,
                data: rawResponse
            } as ApiResponse<ReligionCategoryMappingResponse>;
        }
        
        // If already in ApiResponse format
        if ('success' in response) {
            return response as ApiResponse<ReligionCategoryMappingResponse>;
        }
    }
    
    // Default fallback
    return {
        success: false,
        message: 'Unknown error occurred',
        data: response as unknown as ReligionCategoryMappingResponse
    } as ApiResponse<ReligionCategoryMappingResponse>;
}
