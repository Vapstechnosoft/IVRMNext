
'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import {
    IOnlineLeaveInitialResponse,
    IOnlineLeaveHistoryResponse,
    ILeaveApplicationRequest
} from '@/types/staff-portal/online-leave';
import { HRMS_MI_ID } from '@/constants/hrms-config';

const BASE_URL = 'OnlineLeaveApplication';

/**
 * Get initial leave data including employee profile and leave balances
 * GET /api/OnlineLeaveApplication/get_employee_leave_details
 */
export async function getInitialLeaveData(hrmeId: number = 1207) {
    try {
        console.log(`🔵 [SERVER] getInitialLeaveData for employee: ${hrmeId}`);
        // Add HRME_Id and MI_Id params as they are often required for GET lists
        const url = `/api/OnlineLeaveApplication/get_employee_leave_details?HRME_Id=${hrmeId}&MI_Id=${HRMS_MI_ID}`;

        console.log(`🌐 [SERVER] Calling: GET ${url} on hmslms`);
        const response = await api.get<IOnlineLeaveInitialResponse>('hmslms', url);

        console.log('✅ [SERVER] Response Success:', response?.success);

        // biome-ignore lint/complexity/useOptionalChain: <explanation>
        if (response && response.success) {
            return response.data;
        }

        const rawRes = response as any;
        return rawRes?.data || rawRes;
    } catch (error: any) {
        console.error('🔴 [SERVER] Error in getInitialLeaveData:', error?.message || error);
        return null;
    }
}

/**
 * Get leave application history and status
 * GET /api/OnlineLeaveApplication/get_employee_leave_status_details
 */
export async function getLeaveHistory(hrmeId: number = 1207) {
    try {
        console.log(`🔵 [SERVER] getLeaveHistory for employee: ${hrmeId}`);
        const url = `/api/OnlineLeaveApplication/get_employee_leave_status_details?HRME_Id=${hrmeId}&MI_Id=${HRMS_MI_ID}`;

        console.log(`🌐 [SERVER] Calling: GET ${url} on hmslms`);
        const response = await api.get<IOnlineLeaveHistoryResponse>('hmslms', url);

        // biome-ignore lint/complexity/useOptionalChain: <explanation>
        if (response && response.success) {
            return response.data;
        }

        const rawRes = response as any;
        return rawRes?.data || rawRes;
    } catch (error: any) {
        console.error('🔴 [SERVER] Error in getLeaveHistory:', error?.message || error);
        return null;
    }
}

/**
 * Apply for leave
 * POST /api/OnlineLeaveApplication/save_online_leave_application
 */
export async function applyLeave(payload: ILeaveApplicationRequest) {
    try {
        // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
        const url = `/api/OnlineLeaveApplication/save_online_leave_application`;
        console.log('🟠 [SERVER] Submitting leave application');
        const response = await api.post<any>('hmslms', url, payload);

        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true' || res.returnval === true;

        return {
            success: isSuccess,
            message: res.message || (isSuccess ? 'Leave Applied Successfully.' : 'Failed to apply leave'),
            data: res.data || null
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error in applyLeave:', error?.message || error);
        return { success: false, message: error.message || 'Failed to apply leave' };
    }
}

/**
 * Delete applied leave record
 * DELETE /api/OnlineLeaveApplication/delete_employee_leave_by_id/{hrelap_id}
 */
export async function cancelLeave(hrelapId: number) {
    try {
        console.log(`🔴 [SERVER] Deleting leave record: ${hrelapId}`);
        const url = `/api/OnlineLeaveApplication/delete_employee_leave_by_id/${hrelapId}`;
        const response = await api.delete<any>('hmslms', url);

        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true';

        return {
            success: isSuccess,
            message: res.message || (isSuccess ? 'Leave record deleted successfully.' : 'Failed to delete leave'),
            data: res.data || null
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error in cancelLeave:', error?.message || error);
        return { success: false, message: error.message || 'Failed to delete leave' };
    }
}
