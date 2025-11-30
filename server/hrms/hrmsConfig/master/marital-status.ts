'use server';
import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { MasterMaritalStatusInput, MasterMaritalStatusResponse } from '@/types/hrms/master-marital-status';
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
 * Get onload details for master marital status with search, sort, and pagination
 * POST /api/MasterMaritalStatusFacade/onloadgetdetails
 */
export async function getMasterMaritalStatusList(roleId: number, searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>) {
    const url = '/api/MasterMaritalStatusFacade/onloadgetdetails';
    // Normalize searchParams (convert strings to proper types)
    const normalizedParams = normalizeSearchParams(searchParams);
    // Extract pagination, search, and sort parameters
    const page = normalizedParams.page || 1;
    const page_size = normalizedParams.page_size || 10;
    const search_query = normalizedParams.search_query || '';
    // Define searchable columns
    // These are the columns that can be searched when search_query is provided
    const searchableColumns = 'IVRMMMS_MaritalStatus';
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
        const response = await api.post<MasterMaritalStatusResponse>('hrms', url, requestBody);
        // Transform response to match expected structure
        // The API returns data array directly, or in maritalstatusList for backward compatibility
        const maritalStatusList = Array.isArray(response?.data) 
            ? response.data 
            : (response?.maritalstatusList || (response as any)?.data?.maritalstatusList || []);
        // Use API's total if provided, otherwise use array length
        const total = response?.total ?? (Array.isArray(maritalStatusList) ? maritalStatusList.length : 0);
        // Return in the expected format
        return {
            ...response,
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: maritalStatusList,
            maritalstatusList: maritalStatusList,
            total: total,
            page: response?.page ?? page,
            page_size: response?.page_size ?? page_size
        } as MasterMaritalStatusResponse;
    } catch (error: any) {
        console.error('🔴 [DEBUG] Error Response Data:', JSON.stringify(error?.response?.data, null, 2));
        throw error;
    }
}
export async function saveMasterMaritalStatus(data: MasterMaritalStatusInput) {
    const isEdit = data.IVRMMMS_Id && data.IVRMMMS_Id > 0;
    const url = '/api/MasterMaritalStatusFacade';
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    const currentDate = new Date().toISOString();
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        IVRMMMS_Id: data.IVRMMMS_Id || 0,
        MI_Id: data.MI_Id || 30,
        IVRMMMS_MaritalStatus: data.IVRMMMS_MaritalStatus,
        IVRMMMS_ActiveFlag: data.IVRMMMS_ActiveFlag,
        maritalstatusList: [
            {
                CreatedDate: currentDate,
                UpdatedDate: currentDate,
                IVRMMMS_Id: data.IVRMMMS_Id || 0,
                MI_Id: data.MI_Id || 30,
                IVRMMMS_MaritalStatus: data.IVRMMMS_MaritalStatus,
                IVRMMMS_ActiveFlag: data.IVRMMMS_ActiveFlag
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 30
    };
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
        const response = await api.post<MasterMaritalStatusResponse>('hrms', url, requestBody);
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        console.log('🟢 [API] Response.retrunMsg:', (response as any)?.retrunMsg);
        console.log('🟢 [API] Response.IVRMMMS_Id:', (response as any)?.IVRMMMS_Id);
        // Handle the response format
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || '';
        const savedId = responseData?.IVRMMMS_Id || (responseData?.data as any)?.IVRMMMS_Id || 0;
        const hasMaritalStatusList = !!(responseData?.maritalstatusList || responseData?.data?.maritalstatusList);
        // Check for success indicators
        const isUpdateSuccess = retrunMsg === 'Update' || retrunMsg === 'Saved' || retrunMsg === 'Add' || retrunMsg === 'Order';
        const isDuplicateError = retrunMsg === 'Duplicate';
        const isSuccess = (savedId > 0 || hasMaritalStatusList || isUpdateSuccess) && !isDuplicateError;
        const formattedResponse = {
            success: isSuccess,
            message: isDuplicateError 
                ? 'Marital status already exists'
                : isSuccess 
                    ? (isEdit ? 'Marital status updated successfully' : 'Marital status added successfully')
                    : (retrunMsg || 'Failed to save marital status'),
            data: responseData
        };
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        return formattedResponse as any;
    } catch (error: any) {
        throw error;
    }
}
/**
 * Activate or Deactivate a master marital status record
 * POST /api/MasterMaritalStatusFacade/deactivateRecordById
 */
export async function activateDeactivateMasterMaritalStatus(data: {
    IVRMMMS_Id: number;
    IVRMMMS_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterMaritalStatusFacade/deactivateRecordById';
    const targetState = data.IVRMMMS_ActiveFlag ? 'activate' : 'deactivate';
    // Request body matches Swagger: IVRMMMS_Id, MI_Id, UserId
    const requestBody = {
        IVRMMMS_Id: data.IVRMMMS_Id,
        MI_Id: data.MI_Id || 30,
        UserId: 0
    };
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
        const response = await api.post<MasterMaritalStatusResponse>('hrms', url, requestBody);
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
        // Extract IVRMMMS_Id and IVRMMMS_ActiveFlag from response
        const returnedId = mainData?.IVRMMMS_Id || responseData?.IVRMMMS_Id || 0;
        const returnedActiveFlag = mainData?.IVRMMMS_ActiveFlag;
        // Check if maritalstatusList contains the record with the correct active flag
        const maritalstatusList = mainData?.maritalstatusList || responseData?.maritalstatusList || [];
        const recordInList = maritalstatusList.find((item: any) => item.IVRMMMS_Id === data.IVRMMMS_Id);
        const flagMatchesInList = recordInList ? recordInList.IVRMMMS_ActiveFlag === data.IVRMMMS_ActiveFlag : false;
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
        // 4. Flag matches in the list (if record found in list)
        const idMatches = returnedId === data.IVRMMMS_Id || returnedId > 0;
        const flagMatches = returnedActiveFlag !== undefined ? returnedActiveFlag === data.IVRMMMS_ActiveFlag : flagMatchesInList;
        // CRITICAL: If there's an error message, it's ALWAYS a failure
        // If there's a success message ("Deactivated"/"Activated"), it's a success
        const finalIsSuccess = !isError && (isSuccessMessage || (idMatches && flagMatches));
        // Determine the message to return
        let message = '';
        if (finalIsSuccess) {
            // Use the actual message from the backend
            message = retrunMsg || responseMessage || (data.IVRMMMS_ActiveFlag ? 'Marital Status activated successfully' : 'Marital Status deactivated successfully');
        } else if (retrunMsg && retrunMsg.trim()) {
            // Use the actual error message from the backend
            message = retrunMsg.trim();
        } else if (responseMessage && responseMessage.trim()) {
            message = responseMessage.trim();
        } else {
            message = `Failed to ${targetState} marital status`;
        }
        const formattedResponse = {
            success: finalIsSuccess,
            message: message,
            data: responseData
        };
        console.log('🟢 [API] Formatted response:', JSON.stringify(formattedResponse, null, 2));
        return formattedResponse as any;
    } catch (error: any) {
        throw error;
    }
}
