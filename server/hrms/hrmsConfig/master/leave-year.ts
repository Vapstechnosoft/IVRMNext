'use server';
import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { LeaveYearDetail, MasterLeaveYearInput, MasterLeaveYearResponse } from '@/types/hrms/master-leave-year';
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
 * Get onload details for master leave year with search, sort, and pagination
 * POST /api/MasterLeaveYearFacade/onloadgetdetails
 */
export async function getMasterLeaveYearList(roleId: number, searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>) {
    const url = '/api/MasterLeaveYearFacade/onloadgetdetails';
    // Normalize searchParams (convert strings to proper types)
    const normalizedParams = normalizeSearchParams(searchParams);
    // Extract pagination, search, and sort parameters
    const page = normalizedParams.page || 1;
    const page_size = normalizedParams.page_size || 10;
    const search_query = normalizedParams.search_query || '';
    // Define searchable columns
    // These are the columns that can be searched when search_query is provided
    const searchableColumns = 'HRMLY_LeaveYear';
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
        const response = await api.post<MasterLeaveYearResponse>('hrms', url, requestBody);
        // Transform response to match expected structure
        // The API returns data array directly, or in leaveYearList for backward compatibility
        const leaveYearList = Array.isArray(response?.data) 
            ? response.data 
            : (response?.leaveYearList || (response as any)?.data?.leaveYearList || []);
        // Use API's total if provided, otherwise use array length
        const total = response?.total ?? (Array.isArray(leaveYearList) ? leaveYearList.length : 0);
        // Return in the expected format
        return {
            ...response,
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: leaveYearList,
            leaveYearList: leaveYearList,
            total: total,
            page: response?.page ?? page,
            page_size: response?.page_size ?? page_size
        } as MasterLeaveYearResponse;
    } catch (error: any) {
        console.error('🔴 [DEBUG] Error Response Data:', JSON.stringify(error?.response?.data, null, 2));
        throw error;
    }
}
/**
 * Helper function to convert date string to UTC ISO format
 * Handles both "YYYY-MM-DD" format and existing ISO strings
 * PostgreSQL requires UTC timestamps, so we ensure all dates are in UTC
 */
function formatDateToUTC(dateString: string | undefined): string {
    if (!dateString) return new Date().toISOString();
    // If already in ISO format with timezone (Z or +HH:MM), parse and return as UTC ISO
    if (dateString.includes('T') && (dateString.endsWith('Z') || dateString.includes('+'))) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    }
    // If it's just a date string (YYYY-MM-DD), convert to UTC midnight
    // This ensures PostgreSQL receives a proper UTC timestamp
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        // Create date at midnight UTC by explicitly adding Z timezone
        const date = new Date(dateString + 'T00:00:00.000Z');
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    }
    // If it's ISO format without timezone (YYYY-MM-DDTHH:mm:ss), treat as UTC
    if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+')) {
        const date = new Date(dateString + 'Z');
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    }
    // Try to parse as-is and convert to UTC
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date.toISOString();
    }
    // Fallback to current date if parsing fails
    return new Date().toISOString();
}
/**
 * Create or Update a master leave year record
 * POST /api/MasterLeaveYearFacade (for both create and update)
 */
export async function saveMasterLeaveYear(data: MasterLeaveYearInput) {
    const isEdit = data.HRMLY_Id && data.HRMLY_Id > 0;
    const url = '/api/MasterLeaveYearFacade'; // Use same endpoint for both add and edit
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    const currentDate = new Date().toISOString();
    // Convert dates to UTC ISO format for PostgreSQL compatibility
    // PostgreSQL requires UTC timestamps, so we ensure all dates are explicitly in UTC format
    const fromDateUTC = formatDateToUTC(data.HRMLY_FromDate);
    const toDateUTC = formatDateToUTC(data.HRMLY_ToDate);
    console.log('🟠 [API] - Converted FromDate (UTC):', fromDateUTC);
    console.log('🟠 [API] - Converted ToDate (UTC):', toDateUTC);
    // Build request body matching Swagger API structure exactly
    // Request structure: HRMLY_Id, MI_Id, HRMLY_LeaveYear, HRMLY_FromDate, HRMLY_ToDate, HRMLY_ActiveFlag, CreatedDate, UpdatedDate
    const requestBody = {
        HRMLY_Id: data.HRMLY_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRMLY_LeaveYear: data.HRMLY_LeaveYear || '',
        HRMLY_FromDate: fromDateUTC,
        HRMLY_ToDate: toDateUTC,
        HRMLY_ActiveFlag: data.HRMLY_ActiveFlag ?? true,
        CreatedDate: data.CreatedDate ? formatDateToUTC(data.CreatedDate) : currentDate,
        UpdatedDate: currentDate
    };
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
        const response = await api.post<any>('hrms', url, requestBody);
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        // Response structure from Swagger:
        // {
        //   "success": true,
        //   "message": "record successfully Added",
        //   "data": { ... },
        //   "total": null,
        //   "page": null,
        //   "page_size": null
        // }
        // Extract response data
        const responseData = response?.data || response;
        const success = response?.success ?? false;
        const message = response?.message || responseData?.retrunMsg || '';
        // Check for error messages first (even if success is true, error message means failure)
        const messageLower = message.toLowerCase();
        const hasError = messageLower.includes('error') || 
                        messageLower.includes('error occured') ||
                        messageLower.includes('error occurred') ||
                        messageLower.includes('failed') ||
                        messageLower.includes('exception');
        // Check if the operation was successful
        // Success indicators:
        // 1. No error message
        // 2. response.data.HRMLY_Id > 0 (new record ID)
        // 3. response.message contains "successfully" or response.data.retrunMsg contains "successfully"
        // 4. leaveYearList array is present and not null
        const hasValidId = responseData?.HRMLY_Id && responseData.HRMLY_Id > 0;
        const hasSuccessMessage = message && !hasError && (
            messageLower.includes('successfully') ||
            messageLower.includes('added') ||
            messageLower.includes('updated')
        );
        const hasLeaveYearList = Array.isArray(responseData?.leaveYearList) && responseData.leaveYearList.length > 0;
        // Success only if no error AND (has valid ID OR has success message OR has leave year list)
        const isSuccess = !hasError && success && (hasValidId || hasSuccessMessage || hasLeaveYearList);
        console.log('🟢 [API] - hasValidId:', hasValidId, '(HRMLY_Id:', responseData?.HRMLY_Id, ')');
        // Return response matching Swagger structure
        return {
            success: isSuccess,
            message: message || (isSuccess ? (isEdit ? 'record successfully Updated' : 'record successfully Added') : 'Failed to save leave year'),
            data: responseData,
            total: response?.total ?? null,
            page: response?.page ?? null,
            page_size: response?.page_size ?? null
        };
    } catch (error: any) {
        throw error;
    }
}
/**
 * Get details of a specific master leave year by ID
 * GET /api/MasterLeaveYearFacade/getRecordById/{id}
 */
export async function getMasterLeaveYearDetails(id: number) {
    const url = `/api/MasterLeaveYearFacade/getRecordById/${id}`;
    return await api.get<MasterLeaveYearResponse>('hrms', url);
}
/**
 * Activate or Deactivate a master leave year record
 * POST /api/MasterLeaveYearFacade/deactivateRecordById
 */
export async function activateDeactivateMasterLeaveYear(data: {
    HRMLY_Id: number;
    HRMLY_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterLeaveYearFacade/deactivateRecordById';
    const targetState = data.HRMLY_ActiveFlag ? 'activate' : 'deactivate';
    // Request body matches Swagger: just HRMLY_Id and MI_Id
    const requestBody = {
        HRMLY_Id: data.HRMLY_Id,
        MI_Id: data.MI_Id || 30
    };
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
        const response = await api.post<MasterLeaveYearResponse>('hrms', url, requestBody);
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
        // Extract HRMLY_Id and HRMLY_ActiveFlag from response
        const returnedId = mainData?.HRMLY_Id || responseData?.HRMLY_Id || 0;
        const returnedActiveFlag = mainData?.HRMLY_ActiveFlag;
        // Check for error messages - even if success: true, if retrunMsg is "Error occured", it's a failure
        // Prioritize retrunMsg as it's more specific than response.message
        const retrunMsgLower = retrunMsg ? String(retrunMsg).toLowerCase().trim() : '';
        const responseMessageLower = responseMessage ? String(responseMessage).toLowerCase().trim() : '';
        const hasErrorInRetrunMsg = retrunMsgLower && (
            retrunMsgLower.includes('error') ||
            retrunMsgLower.includes('failed') ||
            retrunMsgLower === 'error occured' ||
            retrunMsgLower === 'error occurred'
        );
        const hasErrorInMessage = responseMessageLower && (
            responseMessageLower.includes('error') ||
            responseMessageLower.includes('failed') ||
            responseMessageLower === 'error occured' ||
            responseMessageLower === 'error occurred'
        );
        const isError = hasErrorInRetrunMsg || hasErrorInMessage;
        // Success indicators:
        // 1. No error message (MOST IMPORTANT - if there's an error message, it's a failure)
        // 2. returnedId matches the requested ID (or > 0)
        // 3. returnedActiveFlag matches the requested state (if provided)
        const idMatches = returnedId === data.HRMLY_Id || returnedId > 0;
        const flagMatches = returnedActiveFlag !== undefined ? returnedActiveFlag === data.HRMLY_ActiveFlag : true;
        // CRITICAL: If there's an error message, it's ALWAYS a failure, regardless of other checks
        const isSuccess = !isError && idMatches && flagMatches;
        // Additional validation: If retrunMsg is "Error occured", force failure
        // This is a safety check to ensure we catch the error even if the includes() check fails
        const explicitError = retrunMsg && (
            retrunMsg === 'Error occured' || 
            retrunMsg === 'Error occurred' ||
            retrunMsg.trim() === 'Error occured' ||
            retrunMsg.trim() === 'Error occurred'
        );
        if (explicitError) {
        }
        // Final error check: combine both checks
        const finalIsError = isError || explicitError;
        const finalIsSuccess = !finalIsError && idMatches && flagMatches;
        // Determine the message to return
        let message = '';
        if (finalIsSuccess) {
            message = data.HRMLY_ActiveFlag 
                ? 'Leave Year activated successfully' 
                : 'Leave Year deactivated successfully';
        } else if (retrunMsg && retrunMsg.trim()) {
            // Use the actual error message from the backend
            message = retrunMsg.trim();
        } else if (responseMessage && responseMessage.trim()) {
            message = responseMessage.trim();
        } else {
            message = `Failed to ${targetState} leave year`;
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
export async function getLeaveYearSetOrder(roleId: number) {
    const url = '/api/MasterLeaveYearFacade/onloadgetdetails';
    const requestBody = {
        page: 1,
        page_size: 1000,
        search_query: '',
        search_column: '',
        sort_column: 'HRMLY_LeaveYearOrder',
        sort_direction: 'asc',
        is_export: false,
        MIID: roleId,
        LoginUserId: 0,
        UserRole: ''
    };
    try {
        const response = await api.post<MasterLeaveYearResponse>('hrms', url, requestBody);
        const leaveYearList = Array.isArray(response?.data) 
            ? response.data 
            : (response?.leaveYearList || (response as any)?.data?.leaveYearList || []);
        return {
            success: true,
            data: leaveYearList.map((ly: LeaveYearDetail) => ({
                HRMLY_Id: ly.HRMLY_Id,
                HRMLY_LeaveYear: ly.HRMLY_LeaveYear,
                HRMLY_LeaveYearOrder: ly.HRMLY_LeaveYearOrder ?? 0
            }))
        };
    } catch (error: any) {
        throw error;
    }
}
export async function saveMasterLeaveYearOrder(leaveYears: LeaveYearDetail[]) {
    const url = '/api/MasterLeaveYearFacade';
    const currentDate = new Date().toISOString();
    // Populate leaveYearList with all leave years and their updated orders
    const requestBody = {
        CreatedDate: currentDate,
        UpdatedDate: currentDate,
        HRMLY_Id: 0,
        MI_Id: 30,
        HRMLY_LeaveYear: 'string',
        HRMLY_FromDate: currentDate,
        HRMLY_ToDate: currentDate,
        HRMLY_ActiveFlag: true,
        leaveYearList: leaveYears.map((ly) => ({
            CreatedDate: ly.CreatedDate || currentDate,
            UpdatedDate: currentDate,  // Always update the UpdatedDate
            HRMLY_Id: ly.HRMLY_Id,
            MI_Id: ly.MI_Id || 30,
            HRMLY_LeaveYear: ly.HRMLY_LeaveYear,
            HRMLY_FromDate: ly.HRMLY_FromDate,
            HRMLY_ToDate: ly.HRMLY_ToDate,
            HRMLY_ActiveFlag: ly.HRMLY_ActiveFlag,
            HRMLY_LeaveYearOrder: ly.HRMLY_LeaveYearOrder ?? 0
        })),
        retrunMsg: 'string',
        roleId: 30,
        ASMAY_From_Date: null,
        ASMAY_To_Date: null,
        HRMLY_LeaveYearOrder: 0,
        yeardetailList: [],
        LeaveorderDTO: []
    };
    console.log('🟠 [API] Sample orders:', requestBody.leaveYearList.slice(0, 3).map(ly => `ID=${ly.HRMLY_Id}, Order=${ly.HRMLY_LeaveYearOrder}`));
    try {
        const response = await api.post<MasterLeaveYearResponse>('hrms', url, requestBody);
        return response;
    } catch (error: any) {
        throw error;
    }
}
export async function updateLeaveYearSetorder(data: Array<{ id: number; order: number }>) {
    const lyListResponse = await getMasterLeaveYearList(30, { page: 1, page_size: 1000 });
    const allLeaveYears = Array.isArray(lyListResponse?.data) 
        ? lyListResponse.data 
        : (lyListResponse?.leaveYearList || []);
    const updatedLeaveYears = allLeaveYears.map((ly) => {
        const orderUpdate = data.find((item) => item.id === ly.HRMLY_Id);
        return {
            ...ly,
            HRMLY_LeaveYearOrder: orderUpdate ? orderUpdate.order : ly.HRMLY_LeaveYearOrder ?? 0
        };
    });
    return await saveMasterLeaveYearOrder(updatedLeaveYears);
}
