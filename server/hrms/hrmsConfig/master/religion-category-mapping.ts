'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import type { ReligionCategoryMappingInput, ReligionCategoryMappingResponse, ReligionCategoryMappingRequest, ReligionCategoryMappingDetail } from '@/types/hrms/religion-category-mapping';

/**
 * Get onload details for religion category mapping
 * POST /api/ReligionCategory_MappingFacade/loaddata
 */
export async function getReligionCategoryMappingList(
    params?: {
        IRCC_Id?: number;
        IVRMMR_Id?: number;
        IMCC_Id?: number;
        UserId?: number;
    }
) {
    const url = '/api/ReligionCategory_MappingFacade/loaddata';
    
    console.log('🟠 ========== RELIGION-CATEGORY ONLOAD API ==========');
    console.log('🟠 [API] getReligionCategoryMappingList called');
    console.log('🟠 [API] Params:', JSON.stringify(params, null, 2));
    
    const now = new Date().toISOString();
    const requestBody: ReligionCategoryMappingRequest = {
        IRCC_Id: params?.IRCC_Id ?? 0,
        MI_Id: 30,
        UserId: params?.UserId ?? 2,
        IVRMMR_Id: params?.IVRMMR_Id ?? 0,
        IMCC_Id: params?.IMCC_Id ?? 0,
        IRCC_ActiveFlg: true,
        IRCC_CreatedBy: 0,
        IRCC_UpdatedBy: 0,
        IRCC_CreatedDate: now,
        IRCC_UpdatedDate: now,
        religion_list: [
            {
                CreatedDate: now,
                UpdatedDate: now,
                IVRMMR_Id: 0,
                IVRMMR_Name: 'string',
                Is_Active: true
            }
        ],
        get_masterlist: [],
        caste_list: [
            {
                CreatedDate: now,
                UpdatedDate: now,
                IMCC_Id: 0,
                IMCC_CategoryName: 'string',
                IMCC_CategoryCode: 'string',
                IMCC_CategoryDesc: 'string'
            }
        ],
        editlist: [],
        returnval: true,
        castid: [],
        duplicate: true,
        IVRMMR_Name: 'string',
        IMCC_CategoryName: 'string',
        msg: 'string'
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<ReligionCategoryMappingResponse>('hrms', url, requestBody);
        
        console.log('🟢 ========== RELIGION-CATEGORY ONLOAD RESPONSE ==========');
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response type:', typeof response);
        console.log('🟢 [API] Response has "success" key:', 'success' in (response || {}));
        console.log('🟢 [API] Response has "data" key:', 'data' in (response || {}));
        
        // Handle case where backend returns data directly (not wrapped in ApiResponse)
        // The backend API might return the data directly, but api.post expects ApiResponse format
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            console.log('🟢 [API] Response is already in ApiResponse format');
            console.log('🟢 [API] response.data:', response.data);
            console.log('🟢 [API] response.data.get_masterlist:', (response.data as any)?.get_masterlist);
            console.log('🟢 [API] response.data.get_masterlist length:', (response.data as any)?.get_masterlist?.length || 0);
            // Already wrapped in ApiResponse format
            return response as ApiResponse<ReligionCategoryMappingResponse>;
        }
        
        console.log('🟢 [API] Response is raw data - wrapping in ApiResponse format');
        console.log('🟢 [API] response.get_masterlist:', (response as any)?.get_masterlist);
        console.log('🟢 [API] response.get_masterlist length:', (response as any)?.get_masterlist?.length || 0);
        console.log('🟢 [API] response.religion_list:', (response as any)?.religion_list);
        console.log('🟢 [API] response.caste_list:', (response as any)?.caste_list);
        
        // Wrap raw response data if backend returns it directly
        const wrappedResponse = {
            success: true,
            message: 'Data loaded successfully',
            data: response as unknown as ReligionCategoryMappingResponse
        } as ApiResponse<ReligionCategoryMappingResponse>;
        
        console.log('🟢 [API] Wrapped response:', JSON.stringify(wrappedResponse, null, 2));
        console.log('🟢 ========== RELIGION-CATEGORY ONLOAD END ==========');
        
        return wrappedResponse;
    } catch (error: any) {
        console.log('🔴 [API] Error occurred');
        console.error('🔴 [API] Error:', error);
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
