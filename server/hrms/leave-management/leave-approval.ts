'use server';

import { HRMS_MI_ID } from '@/constants/hrms-config';
import { api, type ApiResponse } from '@/lib/apiService';
import type {
    GetApprovalStatusRequest,
    GetApprovalStatusResponseData,
    GetStatusAsyncRequest,
    GetStatusAsyncResponseData,
    RejectStatusAsyncRequest,
    RejectStatusAsyncResponseData,
    GetApprovedLeaveRequest,
    GetApprovedLeaveResponseData,
    ViewLeaveBalanceHistoryRequest,
    ViewLeaveBalanceHistoryResponseData,
    GetRequestStatusRequest,
    GetRequestStatusResponseData,
    GetApproveStatusAsyncRequest,
    GetApproveStatusAsyncResponseData,
    GetPeriodApprovalStatusRequest,
    GetPeriodApprovalStatusResponseData,
    PeriodLeaveStatusRequest,
    PeriodLeaveStatusResponseData
} from '@/types/hrms/leave-management/leave-approval';

/**
 * Get leave approval status
 * POST /api/LeaveApprovalFacade/GetApprovalStatus
 * 
 * @param request - Request payload with MI_Id
 * @returns Leave approval status data
 */
export async function getApprovalStatus(request: GetApprovalStatusRequest): Promise<ApiResponse<GetApprovalStatusResponseData>> {
    const url = '/api/LeaveApprovalFacade/GetApprovalStatus';

    const requestBody: GetApprovalStatusRequest = {
        MI_Id: request.MI_Id || HRMS_MI_ID
    };

    console.log('🔵 ========== GET APPROVAL STATUS ==========');
    console.log('🔵 [SERVER] Request URL:', url);
    console.log('🔵 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));

    try {
        const response = await api.post<GetApprovalStatusResponseData>('hmslms', url, requestBody);
        
        console.log('🔵 [SERVER] Response:', JSON.stringify(response, null, 2));

        // Handle the response structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped in ApiResponse format
            return response as ApiResponse<GetApprovalStatusResponseData>;
        }

        // Wrap raw response data
        const responseData = response as any;
        return {
            success: responseData?.success ?? true,
            message: responseData?.message || responseData?.retrunMsg || 'Data fetched successfully',
            data: response as unknown as GetApprovalStatusResponseData
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error:', error);
        console.error('🔴 [SERVER] Error message:', error?.message);
        console.error('🔴 [SERVER] Error response:', error?.response?.data);

        // Extract error message from API response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.retrunMsg || 
                           error?.message || 
                           'Failed to fetch approval status';

        // Throw error so hooks can catch and display it
        throw new Error(errorMessage);
    }
}

/**
 * Get leave status async (for filtering/searching)
 * POST /api/LeaveApprovalFacade/GetStatusAsync
 * 
 * @param request - Request payload with MI_Id and optional filters
 * @returns Leave approval status data filtered by criteria
 */
export async function getStatusAsync(request: GetStatusAsyncRequest): Promise<ApiResponse<GetStatusAsyncResponseData>> {
    const url = '/api/LeaveApprovalFacade/GetStatusAsync';

    const requestBody: GetStatusAsyncRequest = {
        MI_Id: request.MI_Id || HRMS_MI_ID,
        retrunMsg: request.retrunMsg || '',
        HRME_Id: request.HRME_Id || 0,
        HRELTD_FromDate: request.HRELTD_FromDate || '',
        HRELTD_ToDate: request.HRELTD_ToDate || '',
        HRELT_Status: request.HRELT_Status || '',
        LoginId: request.LoginId || 0,
        HRELAPA_Remarks: request.HRELAPA_Remarks || '',
        get_leave_status: request.get_leave_status || []
    };

    console.log('🔵 ========== GET STATUS ASYNC ==========');
    console.log('🔵 [SERVER] Request URL:', url);
    console.log('🔵 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));

    try {
        const response = await api.post<GetStatusAsyncResponseData>('hmslms', url, requestBody);
        
        console.log('🔵 [SERVER] Response:', JSON.stringify(response, null, 2));

        // Handle the response structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped in ApiResponse format
            return response as ApiResponse<GetStatusAsyncResponseData>;
        }

        // Wrap raw response data
        const responseData = response as any;
        return {
            success: responseData?.success ?? true,
            message: responseData?.message || responseData?.retrunMsg || 'Data fetched successfully',
            data: response as unknown as GetStatusAsyncResponseData
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error:', error);
        console.error('🔴 [SERVER] Error message:', error?.message);
        console.error('🔴 [SERVER] Error response:', error?.response?.data);

        // Extract error message from API response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.retrunMsg || 
                           error?.message || 
                           'Failed to fetch leave status';

        // Throw error so hooks can catch and display it
        throw new Error(errorMessage);
    }
}

/**
 * Reject leave status async
 * POST /api/LeaveApprovalFacade/RejectStatusAsync
 * 
 * @param request - Request payload with MI_Id, LoginId, HRELAPA_Remarks, and get_leave_status array
 * @returns Reject response
 */
export async function rejectStatusAsync(request: RejectStatusAsyncRequest): Promise<ApiResponse<RejectStatusAsyncResponseData>> {
    const url = '/api/LeaveApprovalFacade/RejectStatusAsync';

    const requestBody: RejectStatusAsyncRequest = {
        MI_Id: request.MI_Id || HRMS_MI_ID,
        LoginId: request.LoginId || 0,
        HRELAPA_Remarks: request.HRELAPA_Remarks || '',
        get_leave_status: request.get_leave_status || []
    };

    console.log('🔴 ========== REJECT STATUS ASYNC ==========');
    console.log('🔴 [SERVER] Request URL:', url);
    console.log('🔴 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));

    try {
        const response = await api.post<RejectStatusAsyncResponseData>('hmslms', url, requestBody);
        
        console.log('🔴 [SERVER] Response:', JSON.stringify(response, null, 2));

        // Extract return message from response
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || 
                         responseData?.data?.retrunMsg || 
                         responseData?.message || 
                         '';

        // Check for success indicators
        const isUpdateSuccess = retrunMsg === 'Update' || 
                               retrunMsg === 'Rejected' ||
                               retrunMsg === 'Reject' ||
                               retrunMsg === 'Success' ||
                               responseData?.returnval_Update === true ||
                               responseData?.returnval === true;

        const isSuccess = isUpdateSuccess || 
                         ((response as any)?.success === true);

        let message = retrunMsg || 'Failed to reject leave';
        if (isSuccess) {
            message = retrunMsg || 'Leave rejected successfully';
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
                           'Failed to reject leave';

        throw new Error(errorMessage);
    }
}

/**
 * Get approved leave
 * POST /api/LeaveApprovalFacade/GetApprovedLeave
 * 
 * @param request - Request payload with MI_Id and LoginId
 * @returns Approved leave data
 */
export async function getApprovedLeave(request: GetApprovedLeaveRequest): Promise<ApiResponse<GetApprovedLeaveResponseData>> {
    const url = '/api/LeaveApprovalFacade/GetApprovedLeave';

    const requestBody: GetApprovedLeaveRequest = {
        MI_Id: request.MI_Id || HRMS_MI_ID,
        LoginId: request.LoginId || 0
    };

    console.log('🟢 ========== GET APPROVED LEAVE ==========');
    console.log('🟢 [SERVER] Request URL:', url);
    console.log('🟢 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));

    try {
        const response = await api.post<GetApprovedLeaveResponseData>('hmslms', url, requestBody);
        
        console.log('🟢 [SERVER] Response:', JSON.stringify(response, null, 2));

        // Handle the response structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped in ApiResponse format
            return response as ApiResponse<GetApprovedLeaveResponseData>;
        }

        // Wrap raw response data
        const responseData = response as any;
        return {
            success: responseData?.success ?? true,
            message: responseData?.message || responseData?.retrunMsg || 'Data fetched successfully',
            data: response as unknown as GetApprovedLeaveResponseData
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error:', error);
        console.error('🔴 [SERVER] Error message:', error?.message);
        console.error('🔴 [SERVER] Error response:', error?.response?.data);

        // Extract error message from API response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.retrunMsg || 
                           error?.message || 
                           'Failed to fetch approved leave';

        // Throw error so hooks can catch and display it
        throw new Error(errorMessage);
    }
}

/**
 * View leave balance history
 * POST /api/LeaveApprovalFacade/ViewLeaveBalanceHistory
 * 
 * @param request - Request payload with HRME_Id
 * @returns Leave balance history data
 */
export async function viewLeaveBalanceHistory(request: ViewLeaveBalanceHistoryRequest): Promise<ApiResponse<ViewLeaveBalanceHistoryResponseData>> {
    const url = '/api/LeaveApprovalFacade/ViewLeaveBalanceHistory';

    const requestBody: ViewLeaveBalanceHistoryRequest = {
        HRME_Id: request.HRME_Id || 0
    };

    console.log('📊 ========== VIEW LEAVE BALANCE HISTORY ==========');
    console.log('📊 [SERVER] Request URL:', url);
    console.log('📊 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));

    try {
        const response = await api.post<ViewLeaveBalanceHistoryResponseData>('hmslms', url, requestBody);
        
        console.log('📊 [SERVER] Response:', JSON.stringify(response, null, 2));

        // Handle the response structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped in ApiResponse format
            return response as ApiResponse<ViewLeaveBalanceHistoryResponseData>;
        }

        // Wrap raw response data
        const responseData = response as any;
        return {
            success: responseData?.success ?? true,
            message: responseData?.message || responseData?.retrunMsg || 'Data fetched successfully',
            data: response as unknown as ViewLeaveBalanceHistoryResponseData
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error:', error);
        console.error('🔴 [SERVER] Error message:', error?.message);
        console.error('🔴 [SERVER] Error response:', error?.response?.data);

        // Extract error message from API response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.retrunMsg || 
                           error?.message || 
                           'Failed to fetch leave balance history';

        // Throw error so hooks can catch and display it
        throw new Error(errorMessage);
    }
}

/**
 * Get request status
 * POST /api/LeaveApprovalFacade/GetRequestStatus
 * 
 * @param request - Request payload with MI_Id and LoginId
 * @returns Request status data
 */
export async function getRequestStatus(request: GetRequestStatusRequest): Promise<ApiResponse<GetRequestStatusResponseData>> {
    const url = '/api/LeaveApprovalFacade/GetRequestStatus';

    const requestBody: GetRequestStatusRequest = {
        MI_Id: request.MI_Id || HRMS_MI_ID,
        LoginId: request.LoginId || 0
    };

    console.log('📋 ========== GET REQUEST STATUS ==========');
    console.log('📋 [SERVER] Request URL:', url);
    console.log('📋 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));

    try {
        const response = await api.post<GetRequestStatusResponseData>('hmslms', url, requestBody);
        
        console.log('📋 [SERVER] Response:', JSON.stringify(response, null, 2));

        // Handle the response structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped in ApiResponse format
            return response as ApiResponse<GetRequestStatusResponseData>;
        }

        // Wrap raw response data
        const responseData = response as any;
        return {
            success: responseData?.success ?? true,
            message: responseData?.message || responseData?.retrunMsg || 'Data fetched successfully',
            data: response as unknown as GetRequestStatusResponseData
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error:', error);
        console.error('🔴 [SERVER] Error message:', error?.message);
        console.error('🔴 [SERVER] Error response:', error?.response?.data);

        // Extract error message from API response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.retrunMsg || 
                           error?.message || 
                           'Failed to fetch request status';

        // Throw error so hooks can catch and display it
        throw new Error(errorMessage);
    }
}

/**
 * Get approve status async
 * POST /api/LeaveApprovalFacade/GetApproveStatusAsync
 * 
 * @param request - Request payload with LoginId, MI_Id, and doc_list2 array
 * @returns Approve status data
 */
export async function getApproveStatusAsync(request: GetApproveStatusAsyncRequest): Promise<ApiResponse<GetApproveStatusAsyncResponseData>> {
    const url = '/api/LeaveApprovalFacade/GetApproveStatusAsync';

    const requestBody: GetApproveStatusAsyncRequest = {
        LoginId: request.LoginId || 0,
        MI_Id: request.MI_Id || HRMS_MI_ID,
        doc_list2: request.doc_list2 || []
    };

    console.log('✅ ========== GET APPROVE STATUS ASYNC ==========');
    console.log('✅ [SERVER] Request URL:', url);
    console.log('✅ [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));

    try {
        const response = await api.post<GetApproveStatusAsyncResponseData>('hmslms', url, requestBody);
        
        console.log('✅ [SERVER] Response:', JSON.stringify(response, null, 2));

        // Handle the response structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped in ApiResponse format
            return response as ApiResponse<GetApproveStatusAsyncResponseData>;
        }

        // Extract return message from response
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || 
                         responseData?.data?.retrunMsg || 
                         responseData?.message || 
                         '';

        // Check for success indicators
        const isUpdateSuccess = retrunMsg === 'Update' || 
                               retrunMsg === 'Approved' ||
                               retrunMsg === 'Approve' ||
                               retrunMsg === 'Success' ||
                               responseData?.returnval_Update === true ||
                               responseData?.returnval === true;

        const isSuccess = isUpdateSuccess || 
                         ((response as any)?.success === true);

        let message = retrunMsg || 'Data fetched successfully';
        if (isSuccess) {
            message = retrunMsg || 'Approve status fetched successfully';
        }

        return {
            success: isSuccess,
            message: message,
            data: responseData?.data || responseData as unknown as GetApproveStatusAsyncResponseData
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error:', error);
        console.error('🔴 [SERVER] Error message:', error?.message);
        console.error('🔴 [SERVER] Error response:', error?.response?.data);

        // Extract error message from API response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.retrunMsg || 
                           error?.message || 
                           'Failed to fetch approve status';

        // Throw error so hooks can catch and display it
        throw new Error(errorMessage);
    }
}

/**
 * Get period approval status
 * POST /api/LeaveApprovalFacade/GetPeriodApprovalStatus
 * 
 * @param request - Request payload with MI_Id and LoginId
 * @returns Period approval status data
 */
export async function getPeriodApprovalStatus(request: GetPeriodApprovalStatusRequest): Promise<ApiResponse<GetPeriodApprovalStatusResponseData>> {
    const url = '/api/LeaveApprovalFacade/GetPeriodApprovalStatus';

    const requestBody: GetPeriodApprovalStatusRequest = {
        MI_Id: request.MI_Id || HRMS_MI_ID,
        LoginId: request.LoginId || 0
    };

    console.log('📅 ========== GET PERIOD APPROVAL STATUS ==========');
    console.log('📅 [SERVER] Request URL:', url);
    console.log('📅 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));

    try {
        const response = await api.post<GetPeriodApprovalStatusResponseData>('hmslms', url, requestBody);
        
        console.log('📅 [SERVER] Response:', JSON.stringify(response, null, 2));

        // Handle the response structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped in ApiResponse format
            return response as ApiResponse<GetPeriodApprovalStatusResponseData>;
        }

        // Wrap raw response data
        const responseData = response as any;
        return {
            success: responseData?.success ?? true,
            message: responseData?.message || responseData?.retrunMsg || 'Data fetched successfully',
            data: response as unknown as GetPeriodApprovalStatusResponseData
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error:', error);
        console.error('🔴 [SERVER] Error message:', error?.message);
        console.error('🔴 [SERVER] Error response:', error?.response?.data);

        // Extract error message from API response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.retrunMsg || 
                           error?.message || 
                           'Failed to fetch period approval status';

        // Throw error so hooks can catch and display it
        throw new Error(errorMessage);
    }
}

/**
 * Period leave status
 * POST /api/LeaveApprovalFacade/PeriodLeaveStatus
 * 
 * @param request - Request payload with HRELAPDD_ApprovalFlg, HRELAPDD_Remarks, LoginId, and get_leave_status array
 * @returns Period leave status response
 */
export async function periodLeaveStatus(request: PeriodLeaveStatusRequest): Promise<ApiResponse<PeriodLeaveStatusResponseData>> {
    const url = '/api/LeaveApprovalFacade/PeriodLeaveStatus';

    const requestBody: PeriodLeaveStatusRequest = {
        HRELAPDD_ApprovalFlg: request.HRELAPDD_ApprovalFlg || '',
        HRELAPDD_Remarks: request.HRELAPDD_Remarks || '',
        LoginId: request.LoginId || 0,
        get_leave_status: request.get_leave_status || []
    };

    console.log('📆 ========== PERIOD LEAVE STATUS ==========');
    console.log('📆 [SERVER] Request URL:', url);
    console.log('📆 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));

    try {
        const response = await api.post<PeriodLeaveStatusResponseData>('hmslms', url, requestBody);
        
        console.log('📆 [SERVER] Response:', JSON.stringify(response, null, 2));

        // Extract return message from response
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || 
                         responseData?.data?.retrunMsg || 
                         responseData?.message || 
                         '';

        // Check for success indicators
        const isUpdateSuccess = retrunMsg === 'Update' || 
                               retrunMsg === 'Approved' ||
                               retrunMsg === 'Rejected' ||
                               retrunMsg === 'Success' ||
                               responseData?.returnval_Update === true ||
                               responseData?.returnval === true;

        const isSuccess = isUpdateSuccess || 
                         ((response as any)?.success === true);

        let message = retrunMsg || 'Failed to process period leave status';
        if (isSuccess) {
            message = retrunMsg || 'Period leave status processed successfully';
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
                           'Failed to process period leave status';

        throw new Error(errorMessage);
    }
}

