'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    DepartmentDetail,
    MasterDepartmentInput,
    MasterDepartmentResponse,
    OnloadGetDepartmentDetailsRequest,
    SaveDepartmentRequest
} from '@/types/hrms/master-department';

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
 * Get onload details for master department with search, sort, and pagination
 * POST /api/MasterDepartmentFacade/onloadgetdetails
 */
export async function getMasterDepartmentList(roleId: number, searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>) {
    const url = '/api/MasterDepartmentFacade/onloadgetdetails';
    
    // Normalize searchParams (convert strings to proper types)
    const normalizedParams = normalizeSearchParams(searchParams);
    
    // Extract pagination, search, and sort parameters
    const page = normalizedParams.page || 1;
    const page_size = normalizedParams.page_size || 10;
    const search_query = normalizedParams.search_query || '';
    
    // Define searchable columns
    // These are the columns that can be searched when search_query is provided
    const searchableColumns = 'HRMD_DepartmentName';
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
        const response = await api.post<MasterDepartmentResponse>('hrms', url, requestBody);
        
        // Transform response to match expected structure
        // The API returns data array directly, or in departmentList for backward compatibility
        const departmentList = Array.isArray(response?.data) 
            ? response.data 
            : (response?.departmentList || (response as any)?.data?.departmentList || []);
        
        // Use API's total if provided, otherwise use array length
        const total = response?.total ?? (Array.isArray(departmentList) ? departmentList.length : 0);
        
        // Return in the expected format
        return {
            ...response,
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: departmentList,
            departmentList: departmentList,
            total: total,
            page: response?.page ?? page,
            page_size: response?.page_size ?? page_size
        } as MasterDepartmentResponse;
    } catch (error: any) {
        console.error('🔴 [DEBUG] getMasterDepartmentList - Error Details:');
        console.error('🔴 [DEBUG] Error Message:', error?.message);
        console.error('🔴 [DEBUG] Error Response Status:', error?.response?.status);
        console.error('🔴 [DEBUG] Error Response Data:', JSON.stringify(error?.response?.data, null, 2));
        throw error;
    }
}

export async function saveMasterDepartment(data: MasterDepartmentInput) {
    const isEdit = data.HRMD_Id && data.HRMD_Id > 0;
    const url = '/api/MasterDepartmentFacade';
    
    console.log('🟠 [API] saveMasterDepartment called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    
    const now = new Date().toISOString();
    const requestBody: SaveDepartmentRequest = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMD_Id: data.HRMD_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRMD_DepartmentName: data.HRMD_DepartmentName,
        HRMD_Order: data.HRMD_Order ?? 0,
        HRMD_ActiveFlag: data.HRMD_ActiveFlag,
        departmentList: [
            {
                CreatedDate: now,
                UpdatedDate: now,
                HRMD_Id: data.HRMD_Id || 0,
                MI_Id: data.MI_Id || 30,
                HRMD_DepartmentName: data.HRMD_DepartmentName,
                HRMD_Order: data.HRMD_Order ?? 0,
                HRMD_ActiveFlag: data.HRMD_ActiveFlag,
                HRMD_InternalTrainingMinimumHrs: data.HRMD_InternalTrainingMinimumHrs
            }
        ],
        retrunMsg: 'string',
        HRMDC_ID: 0,
        roleId: data.MI_Id || 30,
        HRMD_InternalTrainingMinimumHrs: data.HRMD_InternalTrainingMinimumHrs,
        DeraptmentDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<MasterDepartmentResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        
        const responseData = response as any;
        
        // Check for response structure: { success: true, message: "Add", data: { retrunMsg: "Add", ... } }
        // or direct structure: { retrunMsg: "Add", HRMD_Id: ..., ... }
        const topLevelSuccess = responseData?.success === true;
        const topLevelMessage = responseData?.message || '';
        const nestedData = responseData?.data || responseData;
        
        const retrunMsg = nestedData?.retrunMsg || responseData?.retrunMsg || topLevelMessage || '';
        const savedId = nestedData?.HRMD_Id || responseData?.HRMD_Id || 0;
        const hasDepartmentList = !!(nestedData?.departmentList?.length > 0 || responseData?.departmentList?.length > 0);
        
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add' || retrunMsg === 'Order';
        const isDuplicateError = retrunMsg === 'Duplicate';
        
        // If top level success is true, trust it; otherwise check other indicators
        const isSuccess = topLevelSuccess || ((savedId > 0 || isUpdateSuccess || hasDepartmentList) && !isDuplicateError);
        
        console.log('🟢 [API] Parsed - topLevelSuccess:', topLevelSuccess, 'topLevelMessage:', topLevelMessage);
        console.log('🟢 [API] Parsed - savedId:', savedId, 'retrunMsg:', retrunMsg, 'hasDepartmentList:', hasDepartmentList);
        console.log('🟢 [API] isSuccess:', isSuccess, 'isDuplicate:', isDuplicateError);
        
        const formattedResponse = {
            success: isSuccess,
            message: isDuplicateError 
                ? 'Department already exists'
                : isSuccess 
                    ? (topLevelMessage || (isEdit ? 'Department updated successfully' : 'Department added successfully'))
                    : (retrunMsg || 'Failed to save department'),
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

export async function activateDeactivateMasterDepartment(data: {
    HRMD_Id: number;
    HRMD_ActiveFlag: boolean;
    roleId?: number;
}) {
    const url = '/api/MasterDepartmentFacade/deactivateRecordById';
    const targetState = data.HRMD_ActiveFlag ? 'activate' : 'deactivate';
    
    // Request body matches Swagger: HRMD_Id, MI_Id, UserId
    const requestBody = {
        HRMD_Id: data.HRMD_Id,
        MI_Id: data.roleId || 30,
        UserId: 0
    };
    
    console.log('🟠 [API] activateDeactivateMasterDepartment called');
    console.log('🟠 [API] Target state:', targetState);
    console.log('🟠 [API] HRMD_Id:', data.HRMD_Id);
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    
    try {
        const response = await api.post<MasterDepartmentResponse>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.success:', response?.success);
        console.log('🟢 [API] Response.message:', response?.message);
        console.log('🟢 [API] Response.data:', response?.data);
        
        // Handle the response format - extract data from response.data
        const responseData = response as any;
        const mainData = responseData?.data || responseData;
        
        // Extract retrunMsg and message from the correct location
        const retrunMsg = mainData?.retrunMsg || 
                         responseData?.retrunMsg || 
                         response?.message || 
                         '';
        const responseMessage = response?.message || '';
        
        // Extract HRMD_Id and HRMD_ActiveFlag from response
        const returnedId = mainData?.HRMD_Id || responseData?.HRMD_Id || 0;
        const returnedActiveFlag = mainData?.HRMD_ActiveFlag;
        
        // Check if departmentList contains the record with the correct active flag
        const departmentList = mainData?.departmentList || responseData?.departmentList || [];
        const recordInList = departmentList.find((item: any) => item.HRMD_Id === data.HRMD_Id);
        const flagMatchesInList = recordInList ? recordInList.HRMD_ActiveFlag === data.HRMD_ActiveFlag : false;
        
        console.log('🟢 [API] Parsed values:');
        console.log('🟢 [API] - returnedId:', returnedId);
        console.log('🟢 [API] - returnedActiveFlag:', returnedActiveFlag);
        console.log('🟢 [API] - retrunMsg:', retrunMsg);
        console.log('🟢 [API] - responseMessage:', responseMessage);
        console.log('🟢 [API] - departmentList count:', departmentList.length);
        console.log('🟢 [API] - recordInList:', recordInList ? 'found' : 'not found');
        console.log('🟢 [API] - flagMatchesInList:', flagMatchesInList);
        
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
        
        console.log('🟢 [API] Success detection:');
        console.log('🟢 [API] - isSuccessMessage:', isSuccessMessage);
        console.log('🟢 [API] - isError:', isError);
        console.log('🟢 [API] - retrunMsgLower:', retrunMsgLower);
        console.log('🟢 [API] - responseMessageLower:', responseMessageLower);
        
        // Success indicators:
        // 1. Success message ("Deactivated" or "Activated")
        // 2. No error message
        // 3. returnedId matches the requested ID (or > 0)
        // 4. Flag matches in the list (if record found in list)
        const idMatches = returnedId === data.HRMD_Id || returnedId > 0;
        const flagMatches = returnedActiveFlag !== undefined ? returnedActiveFlag === data.HRMD_ActiveFlag : flagMatchesInList;
        
        // CRITICAL: If there's an error message, it's ALWAYS a failure
        // If there's a success message ("Deactivated"/"Activated"), it's a success
        const finalIsSuccess = !isError && (isSuccessMessage || (idMatches && flagMatches));
        
        console.log('🟢 [API] Final validation:');
        console.log('🟢 [API] - idMatches:', idMatches);
        console.log('🟢 [API] - flagMatches:', flagMatches);
        console.log('🟢 [API] - finalIsSuccess:', finalIsSuccess);
        
        // Determine the message to return
        let message = '';
        if (finalIsSuccess) {
            // Use the actual message from the backend
            message = retrunMsg || responseMessage || (data.HRMD_ActiveFlag ? 'Department activated successfully' : 'Department deactivated successfully');
        } else if (retrunMsg && retrunMsg.trim()) {
            // Use the actual error message from the backend
            message = retrunMsg.trim();
        } else if (responseMessage && responseMessage.trim()) {
            message = responseMessage.trim();
        } else {
            message = `Failed to ${targetState} department`;
        }
        
        console.log('🟢 [API] Final message:', message);
        
        const formattedResponse = {
            success: finalIsSuccess,
            message: message,
            data: responseData
        };
        
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        
        return formattedResponse as any;
    } catch (error: any) {
        console.log('🔴 [API] Error occurred in activateDeactivateMasterDepartment');
        console.error('🔴 [API] Error:', error);
        console.error('🔴 [API] Error message:', error?.message);
        console.error('🔴 [API] Error response:', error?.response);
        console.error('🔴 [API] Error response data:', error?.response?.data);
        throw error;
    }
}

export async function getOnloadDepartmentDetails(roleId: number) {
    const url = '/api/MasterDepartmentFacade/onloadgetdetails';
    const requestBody: OnloadGetDepartmentDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMD_Id: 0,
        MI_Id: 30,
        HRMD_DepartmentName: 'string',
        HRMD_Order: 0,
        HRMD_ActiveFlag: true,
        departmentList: [],
        retrunMsg: 'string',
        HRMDC_ID: 0,
        roleId,
        HRMD_InternalTrainingMinimumHrs: 0,
        DeraptmentDTO: []
    } as unknown as OnloadGetDepartmentDetailsRequest;
    return await api.post<MasterDepartmentResponse>('hrms', url, requestBody);
}

export async function getDepartmentById(id: number) {
    const url = `/api/MasterDepartmentFacade/getRecordById/${id}`;
    return await api.get<MasterDepartmentResponse>('hrms', url);
}

export async function saveMasterDepartmentOrder(departments: DepartmentDetail[]) {
    console.log('🟠 [API] saveMasterDepartmentOrder called');
    console.log('🟠 [API] Number of departments to update:', departments.length);
    
    const url = '/api/MasterDepartmentFacade';
    const now = new Date().toISOString();
    
    // Use departmentList array (same as save endpoint)
    const requestBody: SaveDepartmentRequest = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMD_Id: 0,
        MI_Id: 30,
        HRMD_DepartmentName: 'string',
        HRMD_Order: 0,
        HRMD_ActiveFlag: true,
        departmentList: departments.map((dept) => ({
            CreatedDate: dept.CreatedDate || now,
            UpdatedDate: now,
            HRMD_Id: dept.HRMD_Id,
            MI_Id: dept.MI_Id || 30,
            HRMD_DepartmentName: dept.HRMD_DepartmentName,
            HRMD_Order: dept.HRMD_Order ?? 0,
            HRMD_ActiveFlag: dept.HRMD_ActiveFlag,
            HRMD_InternalTrainingMinimumHrs: dept.HRMD_InternalTrainingMinimumHrs
        })),
        retrunMsg: 'string',
        HRMDC_ID: 0,
        roleId: 30,
        HRMD_InternalTrainingMinimumHrs: 0,
        DeraptmentDTO: []
    };
    
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] departmentList count:', requestBody.departmentList.length);
    
    try {
        const response = await api.post<MasterDepartmentResponse>('hrms', url, requestBody);
        console.log('🟢 [API] saveMasterDepartmentOrder response:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🟢 [API] Response.departmentList count:', (response as any)?.departmentList?.length);
        return response;
    } catch (error: any) {
        console.log('🔴 [API] saveMasterDepartmentOrder error:', error);
        throw error;
    }
}
