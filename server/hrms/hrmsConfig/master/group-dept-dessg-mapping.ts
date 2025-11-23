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
 * POST /api/MasterGroupDeptDessgFacade/onloadgetdetails
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
    const url = '/api/MasterGroupDeptDessgFacade/onloadgetdetails';
    
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
        const response = await api.post<any>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        
        // Response structure from API:
        // {
        //   "success": true,
        //   "message": "Data fetched successfully",
        //   "data": {
        //     "groupTypedropdown": [...],
        //     "departmentdropdown": [...],
        //     "designationdropdown": [...],
        //     "gridviewdata": [...]
        //   },
        //   "total": null,
        //   "page": null,
        //   "page_size": null
        // }
        
        // Extract data from response structure
        let gridviewdata: GroupDeptDessgMappingDetail[] = [];
        let groupTypedropdown: any[] = [];
        let departmentdropdown: any[] = [];
        let designationdropdown: any[] = [];
        
        if (response && typeof response === 'object') {
            const responseData = response.data;
            
            // Extract from data object
            if (responseData && typeof responseData === 'object') {
                // Extract gridviewdata array
                if (Array.isArray(responseData.gridviewdata)) {
                    gridviewdata = responseData.gridviewdata;
                }
                
                // Extract groupTypedropdown
                if (Array.isArray(responseData.groupTypedropdown)) {
                    groupTypedropdown = responseData.groupTypedropdown;
                }
                
                // Extract departmentdropdown
                if (Array.isArray(responseData.departmentdropdown)) {
                    departmentdropdown = responseData.departmentdropdown;
                }
                
                // Extract designationdropdown
                if (Array.isArray(responseData.designationdropdown)) {
                    designationdropdown = responseData.designationdropdown;
                }
            }
        }
        
        // Use API's total if provided, otherwise use array length
        const total = response?.total ?? (Array.isArray(gridviewdata) ? gridviewdata.length : 0);
        
        console.log('🟢 [API] Response parsing:');
        console.log('🟢 [API] - success:', response?.success);
        console.log('🟢 [API] - message:', response?.message);
        console.log('🟢 [API] - gridviewdata length:', gridviewdata.length);
        console.log('🟢 [API] - groupTypedropdown length:', groupTypedropdown.length);
        console.log('🟢 [API] - departmentdropdown length:', departmentdropdown.length);
        console.log('🟢 [API] - designationdropdown length:', designationdropdown.length);
        console.log('🟢 [API] - total:', total);
        console.log('🟢 [API] - page:', response?.page);
        console.log('🟢 [API] - page_size:', response?.page_size);
        
        // Return in the expected format
        const transformedResponse: GroupDeptDessgMappingResponse = {
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: {
                gridviewdata: gridviewdata,
                groupTypedropdown: groupTypedropdown,
                departmentdropdown: departmentdropdown,
                designationdropdown: designationdropdown
            },
            gridviewdata: gridviewdata, // For backward compatibility
            groupTypedropdown: groupTypedropdown,
            departmentdropdown: departmentdropdown,
            designationdropdown: designationdropdown,
            total: total,
            page: (typeof response?.page === 'number' ? response.page : page) || page,
            page_size: (typeof response?.page_size === 'number' ? response.page_size : page_size) || page_size
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
 * POST /api/MasterGroupDeptDessgFacade/savedata (both create and update)
 */
export async function saveGroupDeptDessgMapping(data: GroupDeptDessgMappingInput) {
    const url = '/api/MasterGroupDeptDessgFacade/savedata';
    
    console.log('🟠 [API] saveGroupDeptDessgMapping called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    
    // Get designation IDs from designationids array
    const designationIds = data.designationids || [];
    
    // Validate that we have at least one designation ID
    if (designationIds.length === 0) {
        throw new Error('At least one valid designation ID is required');
    }
    
    // Filter out 0 values from designation IDs
    const validDesignationIds = designationIds.filter((id): id is number => typeof id === 'number' && !Number.isNaN(id) && id > 0);
    
    if (validDesignationIds.length === 0) {
        throw new Error('At least one valid designation ID is required');
    }
    
    // Validate that we have valid group type and department IDs
    if (!data.hrmgT_Id || data.hrmgT_Id === 0) {
        throw new Error('Group Type ID is required and must be greater than 0');
    }
    
    if (!data.hrmD_Id || data.hrmD_Id === 0) {
        throw new Error('Department ID is required and must be greater than 0');
    }
    
    // Request body matches the exact structure from Swagger
    // Structure: { MI_Id, HRMGT_Id, HRMD_Id, HRMDES_Ids[], UserId }
    const requestBody = {
        MI_Id: data.mI_Id || 30,
        HRMGT_Id: data.hrmgT_Id,
        HRMD_Id: data.hrmD_Id,
        HRMDES_Ids: validDesignationIds,
        UserId: data.logInUserId || 0
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<any>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        
        // Extract response data
        const responseData = response?.data || response;
        const success = response?.success ?? false;
        const message = response?.message || responseData?.msg || responseData?.retrunMsg || '';
        
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
        // 4. Message contains success keywords
        const returnval = responseData?.returnval ?? false;
        const hasSuccessMessage = message && !hasError && (
            messageLower.includes('saved') ||
            messageLower.includes('successfully') ||
            messageLower.includes('added') ||
            messageLower.includes('updated')
        );
        
        // Success only if no error AND (success flag OR returnval OR has success message)
        const isSuccess = !hasError && (success || returnval || hasSuccessMessage);
        
        console.log('🟢 [API] Response parsing:');
        console.log('🟢 [API] - success:', success);
        console.log('🟢 [API] - message:', message);
        console.log('🟢 [API] - hasError:', hasError);
        console.log('🟢 [API] - returnval:', returnval);
        console.log('🟢 [API] - hasSuccessMessage:', hasSuccessMessage);
        console.log('🟢 [API] - Final isSuccess:', isSuccess);
        
        // Determine the message to return - prioritize API message
        let finalMessage = message;
        if (!finalMessage) {
            if (isSuccess) {
                finalMessage = 'Mapping saved successfully';
            } else {
                finalMessage = 'Failed to save mapping';
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
        } as ApiResponse<GroupDeptDessgMappingResponse>;
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
                           'Failed to save mapping';
        
        return {
            success: false,
            message: errorMessage,
            data: null,
            total: null,
            page: null,
            page_size: null
        } as unknown as ApiResponse<GroupDeptDessgMappingResponse>;
    }
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
