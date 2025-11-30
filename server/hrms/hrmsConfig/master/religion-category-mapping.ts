'use server';
import { api, type ApiResponse } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { ReligionCategoryMappingInput, ReligionCategoryMappingResponse, ReligionCategoryMappingRequest, ReligionCategoryMappingDetail, ReligionItem, CasteItem } from '@/types/hrms/religion-category-mapping';
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
        const response = await api.post<any>('hrms', url, requestBody);
        // Debug logging (remove in production if needed)
        if (process.env.NODE_ENV === 'development') {
            // Debug logging removed for production
        }
        // Extract data from new response structure: data.mapping, data.religion_list, data.caste_list
        let mappingData: ReligionCategoryMappingDetail[] = [];
        let religionList: ReligionItem[] = [];
        let casteList: CasteItem[] = [];
        if (response && typeof response === 'object' && 'data' in response) {
            const responseData = response.data;
            // Extract mapping array (new structure: data.mapping)
            if (responseData && typeof responseData === 'object') {
                if (Array.isArray(responseData.mapping)) {
                    mappingData = responseData.mapping;
                } else if (Array.isArray(responseData)) {
                    // Backward compatibility: if data is directly an array
                    mappingData = responseData;
                } else if (Array.isArray(responseData.get_masterlist)) {
                    // Backward compatibility: old structure
                    mappingData = responseData.get_masterlist;
                }
                // Extract religion_list (new structure: data.religion_list)
                if (Array.isArray(responseData.religion_list)) {
                    religionList = responseData.religion_list;
                } else if (Array.isArray((response as any).religion_list)) {
                    // Fallback: check root level
                    religionList = (response as any).religion_list;
                }
                // Extract caste_list (new structure: data.caste_list)
                if (Array.isArray(responseData.caste_list)) {
                    casteList = responseData.caste_list;
                } else if (Array.isArray((response as any).caste_list)) {
                    // Fallback: check root level
                    casteList = (response as any).caste_list;
                }
            }
        }
        // Use API's total if provided, otherwise use array length
        const total = response?.total ?? (Array.isArray(mappingData) ? mappingData.length : 0);
        // Return in the expected format
        const transformedResponse: ReligionCategoryMappingResponse = {
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: {
                mapping: mappingData,
                religion_list: religionList,
                caste_list: casteList
            },
            get_masterlist: mappingData, // For backward compatibility
            religion_list: religionList,
            caste_list: casteList,
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
        console.error('🔴 [DEBUG] Error Response Data:', JSON.stringify(error?.response?.data, null, 2));
        throw error;
    }
}
/**
 * Save or Update religion category mapping record
 * POST /api/ReligionCategory_MappingFacade (both create and update)
 */
export async function saveReligionCategoryMapping(data: ReligionCategoryMappingInput) {
    const url = '/api/ReligionCategory_MappingFacade';
    const isNewRecord = !data.IRCC_Id || data.IRCC_Id === 0;
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    // Get the category IDs from categoryids array if available, otherwise use IMCC_Id
    const categoryIds = data.categoryids && Array.isArray(data.categoryids) && data.categoryids.length > 0 
        ? data.categoryids.filter((id): id is number => typeof id === 'number' && !Number.isNaN(id) && id > 0)
        : (data.IMCC_Id && data.IMCC_Id > 0 ? [data.IMCC_Id] : []);
    // Validate that we have at least one category ID
    if (categoryIds.length === 0) {
        throw new Error('At least one valid category ID is required');
    }
    // Get the actual religion ID
    const actualReligionId = data.IVRMMR_Id && data.IVRMMR_Id > 0 ? data.IVRMMR_Id : 0;
    // Validate that we have valid religion ID
    if (actualReligionId === 0) {
        throw new Error('Religion ID is required and must be greater than 0');
    }
    // Ensure IRCC_Id is properly set - it should be 0 for new records, > 0 for updates
    const irccId = data.IRCC_Id && data.IRCC_Id > 0 ? data.IRCC_Id : 0;
    // Request body matches the exact structure from Swagger
    // Structure: { IRCC_Id, MI_Id, IVRMMR_Id, IMCC_Ids[], UserId }
    const requestBody = {
        IRCC_Id: irccId,
        MI_Id: data.MI_Id || 30,
        IVRMMR_Id: actualReligionId,
        IMCC_Ids: categoryIds, // Array of category IDs (filtered to remove 0s)
        UserId: data.UserId || 0
    };
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
        const response = await api.post<ReligionCategoryMappingResponse>('hrms', url, requestBody);
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        // Handle the response format - prioritize standard ApiResponse format
        const responseData = response as any;
        const mainData = responseData?.data || responseData;
        // Extract message from multiple possible locations
        const responseMessage = response?.message || '';
        const dataMsg = mainData?.msg || responseData?.msg || '';
        const retrunMsg = mainData?.retrunMsg || responseData?.retrunMsg || '';
        // Prioritize response.message, then data.msg, then retrunMsg
        const message = responseMessage || dataMsg || retrunMsg || '';
        // Extract returnval if present
        const returnval = mainData?.returnval ?? responseData?.returnval;
        // Check for success indicators
        // 1. response.success === true (highest priority)
        // 2. Message contains success keywords ("Updated", "Saved", "Add", etc.)
        // 3. returnval === true (but some APIs return false even on success)
        const messageLower = message ? String(message).toLowerCase().trim() : '';
        const isSuccessMessage = messageLower === 'updated' ||
                                messageLower === 'saved' ||
                                messageLower === 'add' ||
                                messageLower.includes('success') ||
                                messageLower.includes('updated') ||
                                messageLower.includes('saved');
        // Determine success: prioritize response.success, then check message
        const isSuccess = response?.success === true || 
                         (response?.success !== false && isSuccessMessage) ||
                         returnval === true;
        // Determine the final message
        let finalMessage = message;
        if (!finalMessage || finalMessage.trim() === '' || finalMessage.toLowerCase() === 'string') {
            finalMessage = isNewRecord ? 'Mapping saved successfully' : 'Mapping updated successfully';
        }
        const formattedResponse = {
            success: isSuccess,
            message: finalMessage,
            data: responseData
        };
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        return formattedResponse as ApiResponse<ReligionCategoryMappingResponse>;
    } catch (error: any) {
        if (error?.response?.status === 404) {
            throw new Error('Endpoint not found. Please check the API URL and request structure.');
        }
        throw error;
    }
}
/**
 * Get religion category mapping record by ID
 * POST /api/ReligionCategory_MappingFacade/getRecordById
 */
export async function getReligionCategoryMappingDetails(id: number) {
    const url = '/api/ReligionCategory_MappingFacade/getRecordById';
    // Request body matches the exact structure from Swagger
    const requestBody = {
        IRCC_Id: id
    };
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
        const response = await api.post<ReligionCategoryMappingResponse>('hrms', url, requestBody);
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        return response;
    } catch (error: any) {
        if (error?.response?.status === 404) {
            throw new Error('Record not found or endpoint not available');
        }
        throw error;
    }
}
/**
 * Activate/Deactivate religion category mapping
 * POST /api/ReligionCategory_MappingFacade/deactivateRecordById
 */
export async function activateDeactivateReligionCategoryMapping(data: {
    IRCC_Id: number;
    IRCC_ActiveFlg: boolean;
    MI_Id?: number;
    UserId?: number;
}) {
    const url = '/api/ReligionCategory_MappingFacade/deactivateRecordById';
    const targetState = data.IRCC_ActiveFlg ? 'activate' : 'deactivate';
    // Request body matches the exact structure from Swagger
    const requestBody = {
        IRCC_Id: data.IRCC_Id,
        MI_Id: data.MI_Id || 0,
        UserId: data.UserId || 0
    };
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
        const response = await api.post<ReligionCategoryMappingResponse>('hrms', url, requestBody);
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        // Handle the response format - extract data from response.data
        const responseData = response as any;
        const mainData = responseData?.data || responseData;
        // Extract retrunMsg and message from the correct location
        const retrunMsg = mainData?.retrunMsg || 
                         responseData?.retrunMsg || 
                         response?.message || 
                         '';
        const responseMessage = response?.message || '';
        // Extract IRCC_Id from response
        const returnedId = mainData?.IRCC_Id || responseData?.IRCC_Id || 0;
        const returnedActiveFlag = mainData?.IRCC_ActiveFlg;
        // Check for success messages - "Deactivated" or "Activated" indicate success
        const retrunMsgLower = retrunMsg ? String(retrunMsg).toLowerCase().trim() : '';
        const responseMessageLower = responseMessage ? String(responseMessage).toLowerCase().trim() : '';
        const isSuccessMessage = retrunMsgLower === 'deactivated' || 
                                retrunMsgLower === 'activated' ||
                                responseMessageLower === 'deactivated' ||
                                responseMessageLower === 'activated';
        // Check for error messages
        const hasErrorInRetrunMsg = retrunMsgLower && (
            retrunMsgLower.includes('error') ||
            retrunMsgLower.includes('failed')
        );
        const hasErrorInMessage = responseMessageLower && (
            responseMessageLower.includes('error') ||
            responseMessageLower.includes('failed')
        );
        const isError = hasErrorInRetrunMsg || hasErrorInMessage;
        // Success indicators:
        // 1. Success message ("Deactivated" or "Activated")
        // 2. No error message
        // 3. returnedId matches the requested ID (or > 0)
        // 4. Flag matches (if provided in response)
        const idMatches = returnedId === data.IRCC_Id || returnedId > 0;
        const flagMatches = returnedActiveFlag !== undefined ? returnedActiveFlag === data.IRCC_ActiveFlg : true;
        // CRITICAL: If there's an error message, it's ALWAYS a failure
        // If there's a success message ("Deactivated"/"Activated"), it's a success
        const finalIsSuccess = !isError && (isSuccessMessage || (idMatches && flagMatches));
        // Determine the message to return
        let message = '';
        if (finalIsSuccess) {
            // Use the actual message from the backend
            message = retrunMsg || responseMessage || (data.IRCC_ActiveFlg ? 'Mapping activated successfully' : 'Mapping deactivated successfully');
        } else if (retrunMsg && retrunMsg.trim()) {
            // Use the actual error message from the backend
            message = retrunMsg.trim();
        } else if (responseMessage && responseMessage.trim()) {
            message = responseMessage.trim();
        } else {
            message = `Failed to ${targetState} mapping`;
        }
        const formattedResponse = {
            success: finalIsSuccess,
            message: message,
            data: responseData
        };
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        return formattedResponse as any;
    } catch (error: any) {
        if (error?.response?.status === 404) {
            throw new Error('Endpoint not found. Please check the API URL and request structure.');
        }
        throw error;
    }
}
