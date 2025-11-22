'use server';

import { HRMS_MI_ID } from '@/constants/hrms-config';
import { api, type ApiResponse } from '@/lib/apiService';
import type {
    MasterLeaveGetRequest,
    MasterLeaveGetResponse,
    MasterLeaveGetResponseData,
    MasterLeaveSaveRequest,
    MasterLeaveSaveResponse,
    MasterLeaveValidateOrderRequest,
    MasterLeaveValidateOrderResponse,
    MasterLeaveDTOO,
    MasterLeaveDeleteRequest,
    MasterLeaveDeleteResponse
} from '@/types/hrms/leave-management/master-leave';

/**
 * Get master leave dropdown options (leave types, etc.)
 * This is a helper function that calls GetLeave with HRML_Id=0 to get dropdown data
 */
export async function getMasterLeaveDropdowns(request: { MI_Id?: number }): Promise<{
    leaveTypes: Array<{ value: string; label: string }>;
    leaveOrders: Array<{ value: number; label: string }>;
}> {
    const response = await getMasterLeave({
        MI_Id: request.MI_Id || HRMS_MI_ID,
        HRML_Id: 0
    });

    if (!response.success || !response.data) {
        return {
            leaveTypes: [],
            leaveOrders: []
        };
    }

    // Extract leave types from master_eventlist
    let leaveTypes: Array<{ value: string; label: string }> = [];
    if (response.data.master_eventlist && Array.isArray(response.data.master_eventlist)) {
        leaveTypes = response.data.master_eventlist.map((item: any) => {
            // Handle different possible structures
            const value = item.value || item.LeaveType || item.HRML_LeaveType || item.type || '';
            const label = item.label || item.LeaveTypeName || item.HRML_LeaveName || item.name || value;
            return { value: String(value), label: String(label) };
        }).filter((item: { value: string; label: string }) => item.value && item.label);
    }

    // Extract leave orders from leaveorderlist
    let leaveOrders: Array<{ value: number; label: string }> = [];
    if (response.data.leaveorderlist && Array.isArray(response.data.leaveorderlist)) {
        leaveOrders = response.data.leaveorderlist.map((item: any) => {
            const value = item.value || item.Order || item.HRML_LateDeductOrder || item.order || 0;
            const label = item.label || item.OrderName || String(value);
            return { value: Number(value), label: String(label) };
        }).filter((item: { value: number; label: string }) => item.value !== undefined);
    }

    return {
        leaveTypes,
        leaveOrders
    };
}

/**
 * Get master leave for editing
 * POST /api/MasterLeaveWrapperFacade/Edit
 * 
 * @param HRML_Id - Leave ID to edit
 * @returns Master leave data for editing
 */
export async function getMasterLeaveForEdit(HRML_Id: number): Promise<ApiResponse<MasterLeaveGetResponseData>> {
    const url = '/api/MasterLeaveWrapperFacade/Edit';

    const requestBody = {
        HRML_Id: HRML_Id || 0
    };

    console.log('🔵 ========== MASTER LEAVE EDIT ==========');
    console.log('🔵 [SERVER] Request URL:', url);
    console.log('🔵 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));

    try {
        const response = await api.post<MasterLeaveGetResponseData>('hmslms', url, requestBody);
        
        console.log('🔵 [SERVER] Response:', JSON.stringify(response, null, 2));

        // Handle the response structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped in ApiResponse format
            return response as ApiResponse<MasterLeaveGetResponseData>;
        }

        // Wrap raw response data
        const responseData = response as any;
        return {
            success: responseData?.success ?? true,
            message: responseData?.message || responseData?.retrunMsg || 'Data fetched successfully',
            data: response as unknown as MasterLeaveGetResponseData
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error:', error);
        console.error('🔴 [SERVER] Error message:', error?.message);
        console.error('🔴 [SERVER] Error response:', error?.response?.data);

        // Extract error message from API response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.retrunMsg || 
                           error?.message || 
                           'Failed to fetch master leave data for editing';

        // Throw error so hooks can catch and display it
        throw new Error(errorMessage);
    }
}

/**
 * Get master leave details
 * POST /api/MasterLeaveWrapperFacade/GetLeave
 * 
 * @param request - Request payload with MI_Id and HRML_Id
 * @returns Master leave data
 */
export async function getMasterLeave(request: MasterLeaveGetRequest): Promise<ApiResponse<MasterLeaveGetResponseData>> {
    const url = '/api/MasterLeaveWrapperFacade/GetLeave';

    const requestBody: MasterLeaveGetRequest = {
        MI_Id: request.MI_Id || HRMS_MI_ID,
        HRML_Id: request.HRML_Id || 0
    };

    console.log('🔵 ========== MASTER LEAVE GET ==========');
    console.log('🔵 [SERVER] Request URL:', url);
    console.log('🔵 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));

    try {
        const response = await api.post<MasterLeaveGetResponseData>('hmslms', url, requestBody);
        
        console.log('🔵 [SERVER] Response:', JSON.stringify(response, null, 2));

        // Handle the response structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped in ApiResponse format
            return response as ApiResponse<MasterLeaveGetResponseData>;
        }

        // Wrap raw response data
        const responseData = response as any;
        return {
            success: responseData?.success ?? true,
            message: responseData?.message || responseData?.retrunMsg || 'Data fetched successfully',
            data: response as unknown as MasterLeaveGetResponseData
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error:', error);
        console.error('🔴 [SERVER] Error message:', error?.message);
        console.error('🔴 [SERVER] Error response:', error?.response?.data);

        // Extract error message from API response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.retrunMsg || 
                           error?.message || 
                           'Failed to fetch master leave data';

        // Throw error so hooks can catch and display it
        throw new Error(errorMessage);
    }
}

/**
 * Save or update master leave
 * POST /api/MasterLeaveWrapperFacade/SaveData
 * 
 * @param data - Master leave data to save or update
 * @returns Save/Update response
 */
export async function saveMasterLeave(data: MasterLeaveSaveRequest): Promise<ApiResponse<MasterLeaveGetResponseData>> {
    const url = '/api/MasterLeaveWrapperFacade/SaveData';

    const currentDate = new Date().toISOString();
    const isEdit = data.HRML_Id && data.HRML_Id > 0;

    const requestBody: MasterLeaveSaveRequest = {
        MI_Id: data.MI_Id || HRMS_MI_ID,
        HRML_Id: data.HRML_Id || 0,
        HRML_LeaveName: data.HRML_LeaveName,
        HRML_LeaveCode: data.HRML_LeaveCode,
        HRML_LeaveDetails: data.HRML_LeaveDetails || '',
        HRML_LeaveCreditFlg: data.HRML_LeaveCreditFlg || false,
        HRML_LeaveType: data.HRML_LeaveType,
        HRML_LateDeductFlag: data.HRML_LateDeductFlag || false,
        HRML_LateDeductOrder: data.HRML_LateDeductOrder || 0,
        CreatedDate: data.CreatedDate || currentDate,
        UpdatedDate: currentDate
    };

    console.log('🟠 ========== MASTER LEAVE SAVE ==========');
    console.log('🟠 [SERVER] Request URL:', url);
    console.log('🟠 [SERVER] Is Edit Mode:', isEdit);
    console.log('🟠 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));

    try {
        const response = await api.post<MasterLeaveSaveResponse>('hmslms', url, requestBody);
        
        console.log('🟢 [SERVER] Response:', JSON.stringify(response, null, 2));

        // Extract return message from response
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || 
                         responseData?.data?.retrunMsg || 
                         responseData?.message || 
                         '';

        // Check for duplicate
        const isDuplicate = retrunMsg === 'Duplicate' || 
                           (retrunMsg && retrunMsg.toLowerCase().includes('duplicate'));

        if (isDuplicate) {
            return {
                success: false,
                message: retrunMsg || 'Leave with this name or code already exists',
                data: responseData?.data || null
            };
        }

        // Check for success indicators
        const isUpdateSuccess = retrunMsg === 'Update' || 
                               retrunMsg === 'Saved' || 
                               retrunMsg === 'Add' ||
                               responseData?.returnval_Update === true ||
                               responseData?.returnval_add === true ||
                               responseData?.returnval === true;

        const isSuccess = isUpdateSuccess || 
                         (responseData?.data?.HRML_Id && responseData.data.HRML_Id > 0) ||
                         (response?.success === true);

        let message = retrunMsg || (isEdit ? 'Failed to update leave' : 'Failed to save leave');
        if (isSuccess) {
            message = isEdit ? 'Leave updated successfully' : 'Leave added successfully';
        }

        return {
            success: isSuccess,
            message: message,
            data: responseData?.data || null
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error:', error);
        console.error('🔴 [SERVER] Error message:', error?.message);
        console.error('🔴 [SERVER] Error response:', error?.response?.data);

        // Extract error message from API response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.retrunMsg || 
                           error?.message || 
                           (isEdit ? 'Failed to update leave' : 'Failed to save leave');

        throw new Error(errorMessage);
    }
}

/**
 * Validate order number for master leave
 * POST /api/MasterLeaveWrapperFacade/ValidateOrderNumber
 * 
 * @param request - Request payload with MasterLeaveDTOO array
 * @returns Validation response
 */
export async function validateMasterLeaveOrderNumber(
    request: MasterLeaveValidateOrderRequest
): Promise<ApiResponse<MasterLeaveValidateOrderResponse>> {
    const url = '/api/MasterLeaveWrapperFacade/ValidateOrderNumber';

    const requestBody: MasterLeaveValidateOrderRequest = {
        MasterLeaveDTOO: request.MasterLeaveDTOO.map((item) => ({
            MI_Id: item.MI_Id || HRMS_MI_ID,
            HRML_Id: item.HRML_Id || 0
        }))
    };

    console.log('🟡 ========== MASTER LEAVE VALIDATE ORDER ==========');
    console.log('🟡 [SERVER] Request URL:', url);
    console.log('🟡 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));

    try {
        const response = await api.post<MasterLeaveValidateOrderResponse>('hmslms', url, requestBody);
        
        console.log('🟡 [SERVER] Response:', JSON.stringify(response, null, 2));

        // Handle the response structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped in ApiResponse format
            return response as ApiResponse<MasterLeaveValidateOrderResponse>;
        }

        // Wrap raw response data
        const responseData = response as any;
        return {
            success: responseData?.success ?? true,
            message: responseData?.message || responseData?.retrunMsg || 'Validation completed',
            data: response as unknown as MasterLeaveValidateOrderResponse
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error:', error);
        console.error('🔴 [SERVER] Error message:', error?.message);
        console.error('🔴 [SERVER] Error response:', error?.response?.data);

        // Extract error message from API response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.retrunMsg || 
                           error?.message || 
                           'Failed to validate order number';

        // Throw error so hooks can catch and display it
        throw new Error(errorMessage);
    }
}

/**
 * Delete master leave
 * POST /api/MasterLeaveWrapperFacade/DeletePages
 * 
 * @param HRML_Id - Leave ID to delete
 * @returns Delete response
 */
export async function deleteMasterLeave(HRML_Id: number): Promise<ApiResponse<MasterLeaveDeleteResponse>> {
    const url = '/api/MasterLeaveWrapperFacade/DeletePages';

    const requestBody: MasterLeaveDeleteRequest = {
        HRML_Id: HRML_Id || 0
    };

    console.log('🔴 ========== MASTER LEAVE DELETE ==========');
    console.log('🔴 [SERVER] Request URL:', url);
    console.log('🔴 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));

    try {
        const response = await api.post<MasterLeaveDeleteResponse>('hmslms', url, requestBody);
        
        console.log('🔴 [SERVER] Response:', JSON.stringify(response, null, 2));

        // Handle the response structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped in ApiResponse format
            return response as ApiResponse<MasterLeaveDeleteResponse>;
        }

        // Extract return message from response
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || 
                         responseData?.message || 
                         '';

        // Check for success indicators
        const isSuccess = retrunMsg === 'Delete' || 
                         retrunMsg === 'Deleted' ||
                         retrunMsg === 'Success' ||
                         responseData?.returnval === true ||
                         ((response as any)?.success === true);

        // Wrap raw response data
        return {
            success: isSuccess,
            message: retrunMsg || (isSuccess ? 'Leave deleted successfully' : 'Failed to delete leave'),
            data: response as unknown as MasterLeaveDeleteResponse
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error:', error);
        console.error('🔴 [SERVER] Error message:', error?.message);
        console.error('🔴 [SERVER] Error response:', error?.response?.data);

        // Extract error message from API response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.retrunMsg || 
                           error?.message || 
                           'Failed to delete master leave';

        // Throw error so hooks can catch and display it
        throw new Error(errorMessage);
    }
}

