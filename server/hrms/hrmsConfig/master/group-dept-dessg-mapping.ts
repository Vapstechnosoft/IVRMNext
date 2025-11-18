'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { GroupDeptDessgMappingDetail, GroupDeptDessgMappingInput, GroupDeptDessgMappingResponse, LoadDataRequest } from '@/types/hrms/group-dept-dessg-mapping';

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
 * Get onload details for group department designation mapping with search, sort, and pagination
 * POST /api/GroupDeptDessgFacade/onloadgetdetails
 */
export async function getGroupDeptDessgMappingList(
    searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>,
    params?: {
        HRGTDDS_Id?: number;
        HRMGT_Id?: number;
        HRMD_Id?: number;
        HRMDES_Id?: number;
        LogInUserId?: number;
    }
) {
    const url = '/api/GroupDeptDessgFacade/onloadgetdetails';
    
    // Normalize searchParams (convert strings to proper types)
    const normalizedParams = normalizeSearchParams(searchParams);
    
    // Extract pagination, search, and sort parameters
    const page = normalizedParams.page || 1;
    const page_size = normalizedParams.page_size || 10;
    const search_query = normalizedParams.search_query || '';
    
    // Define searchable columns
    // These are the columns that can be searched when search_query is provided
    const searchableColumns = 'HRMGT_EmployeeGroupType,HRMD_DepartmentName,HRMDES_DesignationName';
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
        LoginUserId: params?.LogInUserId ?? 0,
        UserRole: ''
    };
    
    try {
        const response = await api.post<GroupDeptDessgMappingResponse>('hrms', url, requestBody);
        
        // Transform response to match expected structure
        // The API returns data array directly, or in gridviewdata for backward compatibility
        const gridviewdata = Array.isArray(response?.data) 
            ? response.data 
            : (response?.gridviewdata || (response as any)?.data?.gridviewdata || []);
        
        // Use API's total if provided, otherwise use array length
        const total = response?.total ?? (Array.isArray(gridviewdata) ? gridviewdata.length : 0);
        
        // Return in the expected format
        const transformedResponse: GroupDeptDessgMappingResponse = {
            ...response,
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: gridviewdata,
            gridviewdata: gridviewdata,
            total: total,
            page: response?.page ?? page,
            page_size: response?.page_size ?? page_size
        };
        
        return {
            success: transformedResponse.success ?? true,
            message: transformedResponse.message || 'Data loaded successfully',
            data: transformedResponse
        } as ApiResponse<GroupDeptDessgMappingResponse>;
    } catch (error: any) {
        console.error('🔴 [DEBUG] getGroupDeptDessgMappingList - Error Details:');
        console.error('🔴 [DEBUG] Error Message:', error?.message);
        console.error('🔴 [DEBUG] Error Response Status:', error?.response?.status);
        console.error('🔴 [DEBUG] Error Response Data:', JSON.stringify(error?.response?.data, null, 2));
        throw error;
    }
}

/**
 * Save/Update group department designation mapping
 * POST /api/GroupDeptDessgFacade/savedata (create)
 * POST /api/GroupDeptDessgFacade/Editdata (update)
 */
export async function saveGroupDeptDessgMapping(data: GroupDeptDessgMappingInput) {
    const isNewRecord = !data.hrgtddS_Id || data.hrgtddS_Id === 0;
    const url = isNewRecord ? '/api/GroupDeptDessgFacade/savedata' : '/api/GroupDeptDessgFacade/Editdata';
    
    // Get the first designation ID from designationids array if HRMDES_Id is not set or is 0
    // This ensures HRMDES_Id is set when using multi-select designations
    const designationIds = data.designationids || [];
    const firstDesignationId = designationIds.length > 0 ? designationIds[0] : 0;
    const hrmdesId = data.hrmdeS_Id && data.hrmdeS_Id !== 0 ? data.hrmdeS_Id : firstDesignationId;
    
    // Ensure HRGTDDS_Id is properly set - it should be > 0 for updates to exclude from duplicate check
    const hrgtddS_Id = data.hrgtddS_Id && data.hrgtddS_Id > 0 ? data.hrgtddS_Id : 0;
    
    const requestBody: LoadDataRequest = {
        HRGTDDS_Id: hrgtddS_Id,
        MI_Id: 30,
        HRMGT_Id: data.hrmgT_Id,
        HRMD_Id: data.hrmD_Id,
        HRMDES_Id: hrmdesId,
        HRGTDDS_ActiveFlg: data.hrgtddS_ActiveFlg,
        HRGTDDS_CreatedBy: data.hrgtddS_CreatedBy || data.logInUserId || 5,
        HRGTDDS_UpdatedBy: data.hrgtddS_UpdatedBy || data.logInUserId || 5,
        HRGTDDS_CreatedDate: isNewRecord ? '0001-01-01T00:00:00' : (data.hrgtddS_CreatedDate || new Date().toISOString()),
        HRGTDDS_UpdatedDate: new Date().toISOString(),
        groupTypedropdown: [],
        departmentdropdown: [],
        designationdropdown: [],
        gridviewdata: [],
        designationids: designationIds,
        LogInUserId: data.logInUserId || 5,
        HRMGT_EmployeeGroupType: data.hrmgT_EmployeeGroupType || '',
        HRMD_DepartmentName: data.hrmD_DepartmentName || '',
        HRMDES_DesignationName: data.hrmdeS_DesignationName || '',
        returnval: false,
        msg: ''
    };
    
    const response = await api.post<GroupDeptDessgMappingResponse>('hrms', url, requestBody);
    
    // Handle case where backend returns data directly in response.data with returnval/msg
    // Transform returnval/msg to success/message format
    // Note: Some APIs return returnval=false even on success, so we check msg content too
    if (response && typeof response === 'object') {
        // If response has data field with returnval, transform it
        if ('data' in response && response.data && typeof response.data === 'object' && 'returnval' in response.data) {
            const rawData = response.data as unknown as GroupDeptDessgMappingResponse;
            const message = rawData.msg || '';
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
            } as ApiResponse<GroupDeptDessgMappingResponse>;
        }
        
        // If response itself has returnval (direct response from axios)
        if ('returnval' in response) {
            const rawResponse = response as unknown as GroupDeptDessgMappingResponse;
            const message = rawResponse.msg || '';
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
            } as ApiResponse<GroupDeptDessgMappingResponse>;
        }
        
        // If already in ApiResponse format
        if ('success' in response) {
            return response as ApiResponse<GroupDeptDessgMappingResponse>;
        }
    }
    
    // Default fallback
    return {
        success: false,
        message: 'Unknown error occurred',
        data: response as unknown as GroupDeptDessgMappingResponse
    } as ApiResponse<GroupDeptDessgMappingResponse>;
}

/**
 * Activate/Deactivate group department designation mapping
 * POST /api/GroupDeptDessgFacade/masterDecative
 */
export async function activateDeactivateGroupDeptDessgMapping(data: GroupDeptDessgMappingDetail & { HRGTDDS_ActiveFlg: boolean }) {
    const url = '/api/GroupDeptDessgFacade/masterDecative';
    const requestBody: LoadDataRequest = {
        HRGTDDS_Id: data.HRGTDDS_Id,
        MI_Id: data.MI_Id || 30,
        HRMGT_Id: data.HRMGT_Id || 0,
        HRMD_Id: data.HRMD_Id || 0,
        HRMDES_Id: data.HRMDES_Id || 0,
        HRGTDDS_ActiveFlg: data.HRGTDDS_ActiveFlg,
        HRGTDDS_CreatedBy: data.HRGTDDS_CreatedBy || 5,
        HRGTDDS_UpdatedBy: data.HRGTDDS_UpdatedBy || 5,
        HRGTDDS_CreatedDate: data.HRGTDDS_CreatedDate || new Date().toISOString(),
        HRGTDDS_UpdatedDate: new Date().toISOString(),
        groupTypedropdown: [],
        departmentdropdown: [],
        designationdropdown: [],
        gridviewdata: [],
        designationids: [],
        LogInUserId: data.HRGTDDS_UpdatedBy || 5,
        HRMGT_EmployeeGroupType: data.HRMGT_EmployeeGroupType || '',
        HRMD_DepartmentName: data.HRMD_DepartmentName || '',
        HRMDES_DesignationName: data.HRMDES_DesignationName || '',
        returnval: false,
        msg: ''
    };
    
    const response = await api.post<GroupDeptDessgMappingResponse>('hrms', url, requestBody);
    
    // Handle case where backend returns data directly in response.data with returnval/msg
    // Transform returnval/msg to success/message format
    if (response && typeof response === 'object') {
        // If response has data field with returnval, transform it
        if ('data' in response && response.data && typeof response.data === 'object' && 'returnval' in response.data) {
            const rawData = response.data as unknown as GroupDeptDessgMappingResponse;
            const message = rawData.msg || '';
            // Check if message indicates success (Activated, Deactivated, etc.)
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
            } as ApiResponse<GroupDeptDessgMappingResponse>;
        }
        
        // If response itself has returnval (direct response from axios)
        if ('returnval' in response) {
            const rawResponse = response as unknown as GroupDeptDessgMappingResponse;
            const message = rawResponse.msg || '';
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
            } as ApiResponse<GroupDeptDessgMappingResponse>;
        }
        
        // If already in ApiResponse format
        if ('success' in response) {
            return response as ApiResponse<GroupDeptDessgMappingResponse>;
        }
    }
    
    // Default fallback
    return {
        success: false,
        message: 'Unknown error occurred',
        data: response as unknown as GroupDeptDessgMappingResponse
    } as ApiResponse<GroupDeptDessgMappingResponse>;
}
