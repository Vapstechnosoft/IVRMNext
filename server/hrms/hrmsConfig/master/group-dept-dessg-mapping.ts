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
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
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
 * POST /api/MasterGroupDeptDessgFacade/deactivateRecordById
 */
export async function activateDeactivateGroupDeptDessgMapping(data: GroupDeptDessgMappingDetail & { HRGTDDS_ActiveFlg: boolean }) {
    const url = '/api/MasterGroupDeptDessgFacade/deactivateRecordById';
    // Simple request body as per API specification
    const requestBody = {
        HRGTDDS_Id: data.HRGTDDS_Id,
        MI_Id: data.MI_Id || 30
    };
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
        const response: any = await api.post<any>('hrms', url, requestBody);
        console.log('🟢 [API] Deactivate response:', JSON.stringify(response, null, 2));
        // Handle the API response structure
        // Response format: { success: boolean, message: string, data: {...} }
        if (response && typeof response === 'object') {
            // If response already has success field (standard ApiResponse format)
            if ('success' in response) {
                return {
                    success: response.success,
                    message: response.message || 'Updated successfully',
                    data: response.data || response
                } as ApiResponse<GroupDeptDessgMappingResponse>;
            }
            // If response has data field with returnval
            if ('data' in response && response.data && typeof response.data === 'object') {
                const responseData: any = response.data;
                const message = response.message || responseData.msg || 'Updated successfully';
                const success = response.success !== undefined ? response.success : (responseData.returnval === true || message.toLowerCase().includes('success') || message.toLowerCase().includes('updated'));
                return {
                    success: success,
                    message: message,
                    data: responseData
                } as ApiResponse<GroupDeptDessgMappingResponse>;
            }
            // If response itself is the data object
            if ('returnval' in response || 'HRGTDDS_Id' in response) {
                const rawResponse: any = response;
                const message = rawResponse.msg || response.message || 'Updated successfully';
                const success = rawResponse.returnval === true || message.toLowerCase().includes('success') || message.toLowerCase().includes('updated');
                return {
                    success: success,
                    message: message,
                    data: rawResponse
                } as ApiResponse<GroupDeptDessgMappingResponse>;
            }
        }
        // Default: assume success if we got a response
        return {
            success: true,
            message: (response as any)?.message || 'Updated successfully',
            data: response as unknown as GroupDeptDessgMappingResponse
        } as ApiResponse<GroupDeptDessgMappingResponse>;
    } catch (error: any) {
        // Extract error message
        let errorMessage = 'Failed to update record';
        if (error?.response?.data) {
            const apiError = error.response.data;
            if (typeof apiError === 'string') {
                errorMessage = apiError;
            } else if (apiError?.message) {
                errorMessage = apiError.message;
            } else if (apiError?.msg) {
                errorMessage = apiError.msg;
            }
        } else if (error?.message) {
            errorMessage = error.message;
        }
        throw new Error(errorMessage);
    }
}
