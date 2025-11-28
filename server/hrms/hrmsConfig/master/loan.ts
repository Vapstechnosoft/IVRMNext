'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { MasterLoanInput, MasterLoanResponse } from '@/types/hrms/master-loan';

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
 * Get onload details for master loan with search, sort, and pagination
 * POST /api/MasterLoanFacade/onloadgetdetails
 */
export async function getMasterLoanList(roleId: number, searchParams?: ApiSearchparams | Record<string, string | string[] | undefined>) {
    const url = '/api/MasterLoanFacade/onloadgetdetails';
    
    // Normalize searchParams (convert strings to proper types)
    const normalizedParams = normalizeSearchParams(searchParams);
    
    // Extract pagination, search, and sort parameters
    const page = normalizedParams.page || 1;
    const page_size = normalizedParams.page_size || 10;
    const search_query = normalizedParams.search_query || '';
    
    // Define searchable columns
    // These are the columns that can be searched when search_query is provided
    const searchableColumns = 'HRML_LoanType';
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
        //   "data": [ ... array of loan items ... ],
        //   "total": 5,
        //   "page": 1,
        //   "page_size": 10
        // }
        
        // The API returns data as an array directly
        const loanList = Array.isArray(response?.data) 
            ? response.data 
            : [];
        
        // Use API's total if provided, otherwise use array length
        const total = response?.total ?? loanList.length;
        
        console.log('🟢 [API] Response parsing:');
        console.log('🟢 [API] - success:', response?.success);
        console.log('🟢 [API] - message:', response?.message);
        console.log('🟢 [API] - data array length:', loanList.length);
        console.log('🟢 [API] - total:', total);
        console.log('🟢 [API] - page:', response?.page);
        console.log('🟢 [API] - page_size:', response?.page_size);
        
        // Return in the expected format matching the API response structure
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: loanList,
            total: total,
            page: response?.page ?? page,
            page_size: response?.page_size ?? page_size
        } as MasterLoanResponse;
    } catch (error: any) {
        console.error('🔴 [DEBUG] getMasterLoanList - Error Details:');
        console.error('🔴 [DEBUG] Error Message:', error?.message);
        console.error('🔴 [DEBUG] Error Response Status:', error?.response?.status);
        console.error('🔴 [DEBUG] Error Response Data:', JSON.stringify(error?.response?.data, null, 2));
        throw error;
    }
}

/**
 * Save or Update master loan record
 * POST /api/MasterLoanFacade
 */
export async function saveMasterLoan(data: MasterLoanInput) {
    const isEdit = data.HRMLN_Id && data.HRMLN_Id > 0;
    const url = '/api/MasterLoanFacade';
    
    console.log('🟠 [API] saveMasterLoan called');
    console.log('🟠 [API] Input data:', JSON.stringify(data, null, 2));
    console.log('🟠 [API] Is Edit Mode:', isEdit);
    console.log('🟠 [API] URL:', url);
    
    const now = new Date().toISOString();
    
    // Build request body matching Swagger API structure
    const requestBody = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMLN_Id: data.HRMLN_Id || 0,
        MI_Id: data.MI_Id || 30,
        HRML_LoanType: data.HRML_LoanType,
        HRML_Max: Number(data.HRML_Max) || 0,
        HRMLN_ActiveFlag: data.HRMLN_ActiveFlag ?? true,
        gmasterloanList: [
            {
                CreatedDate: now,
                UpdatedDate: now,
                HRMLN_Id: 0,
                MI_Id: 0,
                HRML_LoanType: 'string',
                HRML_Max: 0,
                HRMLN_ActiveFlag: true
            }
        ],
        retrunMsg: 'string',
        roleId: 0
    };
    
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<any>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        
        // Response structure from Swagger:
        // {
        //   "success": true,
        //   "message": "Add",
        //   "data": { ... },
        //   "total": null,
        //   "page": null,
        //   "page_size": null
        // }
        
        // Extract response data
        const responseData = response?.data || response;
        const success = response?.success ?? false;
        const message = response?.message || responseData?.retrunMsg || '';
        
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
        // 3. response.message is "Add" or "Update" or response.data.retrunMsg is "Add" or "Update"
        // 4. response.data.gmasterloanList array is present and not empty
        const retrunMsg = responseData?.retrunMsg || '';
        const retrunMsgLower = retrunMsg.toLowerCase();
        const hasSuccessMessage = (message === 'Add' || message === 'Update' || retrunMsg === 'Add' || retrunMsg === 'Update') && !hasError;
        const hasLoanList = Array.isArray(responseData?.gmasterloanList) && responseData.gmasterloanList.length > 0;
        
        // Success only if no error AND (success flag OR has success message OR has loan list)
        const isSuccess = !hasError && (success || hasSuccessMessage || hasLoanList);
        
        console.log('🟢 [API] Response parsing:');
        console.log('🟢 [API] - success:', success);
        console.log('🟢 [API] - message:', message);
        console.log('🟢 [API] - retrunMsg:', retrunMsg);
        console.log('🟢 [API] - hasError:', hasError);
        console.log('🟢 [API] - hasSuccessMessage:', hasSuccessMessage);
        console.log('🟢 [API] - hasLoanList:', hasLoanList);
        console.log('🟢 [API] - Final isSuccess:', isSuccess);
        
        // Determine the message to return - prioritize API message
        let finalMessage = message || retrunMsg;
        if (!finalMessage) {
            if (hasError) {
                finalMessage = 'Failed to save loan type';
            } else if (isSuccess) {
                finalMessage = isEdit ? 'Loan type updated successfully' : 'Loan type added successfully';
            } else {
                finalMessage = 'Failed to save loan type';
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
                           error?.response?.data?.retrunMsg ||
                           error?.message || 
                           'Failed to save loan type';
        
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
 * Get details of a specific master loan by ID for editing
 * GET /api/MasterLoanFacade/getRecordById/{id}
 */
export async function getMasterLoanDetails(id: number) {
    const url = `/api/MasterLoanFacade/getRecordById/${id}`;
    
    console.log('🟠 [API] getMasterLoanDetails called');
    console.log('🟠 [API] Request URL:', url);
    console.log('🟠 [API] Loan ID:', id);
    
    try {
        const response = await api.get<any>('hrms', url);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        
        // Transform response to match expected structure
        // The API may return data in different formats
        const responseData = response as any;
        const nestedData = responseData?.data || responseData;
        
        // Extract loan item from gmasterloanList if available, or use the data directly
        const loanList = Array.isArray(nestedData?.gmasterloanList) 
            ? nestedData.gmasterloanList 
            : nestedData?.HRMLN_Id 
            ? [nestedData]
            : [];
        
        // Return in the expected format
        return {
            ...response,
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: loanList.length > 0 ? loanList[0] : null,
            gmasterloanList: loanList
        } as any;
    } catch (error: any) {
        console.error('🔴 [DEBUG] getMasterLoanDetails - Error Details:');
        console.error('🔴 [DEBUG] Error Message:', error?.message);
        console.error('🔴 [DEBUG] Error Response Status:', error?.response?.status);
        console.error('🔴 [DEBUG] Error Response Data:', JSON.stringify(error?.response?.data, null, 2));
        throw error;
    }
}

/**
 * Activate or Deactivate a master loan record
 * POST /api/MasterLoanFacade/deactivateRecordById
 */
export async function activateDeactivateMasterLoan(data: {
    HRMLN_Id: number;
    HRMLN_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterLoanFacade/deactivateRecordById';
    const targetState = data.HRMLN_ActiveFlag ? 'activate' : 'deactivate';
    
    // Request body only needs HRMLN_Id and MI_Id
    const requestBody = {
        HRMLN_Id: data.HRMLN_Id,
        MI_Id: data.MI_Id || 30
    };
    
    console.log('🟠 [API] activateDeactivateMasterLoan called');
    console.log('🟠 [API] Target state:', targetState);
    console.log('🟠 [API] HRMLN_Id:', data.HRMLN_Id);
    console.log('🟠 [API] URL:', url);
    console.log('🟠 [API] Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🟠 [API] Calling api.post...');
    
    try {
        const response = await api.post<any>('hrms', url, requestBody);
        
        console.log('🟢 [API] Raw response received:', JSON.stringify(response, null, 2));
        
        // Extract response data
        const responseData = response?.data || response;
        const success = response?.success ?? false;
        const message = response?.message || responseData?.retrunMsg || '';
        
        // Check for error messages (even if success is true, error message means failure)
        const messageLower = message.toLowerCase();
        const hasError = messageLower.includes('error') || 
                        messageLower.includes('failed') ||
                        messageLower.includes('exception') ||
                        messageLower.includes('mapped');
        
        // Check if the operation was successful
        // Success indicators:
        // 1. No error message
        // 2. response.success === true
        // 3. response.message contains "Deactivated" or "Activated" or response.data.retrunMsg contains it
        const retrunMsg = responseData?.retrunMsg || '';
        const retrunMsgLower = retrunMsg.toLowerCase();
        const hasSuccessMessage = (messageLower.includes('deactivated') || 
                                  messageLower.includes('activated') ||
                                  retrunMsgLower.includes('deactivated') ||
                                  retrunMsgLower.includes('activated')) && !hasError;
        
        // Success only if no error AND (success flag OR has success message)
        const isSuccess = !hasError && (success || hasSuccessMessage);
        
        console.log('🟢 [API] Response parsing:');
        console.log('🟢 [API] - success:', success);
        console.log('🟢 [API] - message:', message);
        console.log('🟢 [API] - retrunMsg:', retrunMsg);
        console.log('🟢 [API] - hasError:', hasError);
        console.log('🟢 [API] - hasSuccessMessage:', hasSuccessMessage);
        console.log('🟢 [API] - Final isSuccess:', isSuccess);
        
        // Determine the message to return - prioritize API message
        let finalMessage = message || retrunMsg;
        if (!finalMessage) {
            if (hasError) {
                finalMessage = `Failed to ${targetState} loan`;
            } else if (isSuccess) {
                finalMessage = data.HRMLN_ActiveFlag ? 'Loan activated successfully' : 'Loan deactivated successfully';
            } else {
                finalMessage = `Failed to ${targetState} loan`;
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
                           error?.response?.data?.retrunMsg ||
                           error?.message || 
                           `Failed to ${targetState} loan`;
        
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
