'use server';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { api, type ApiResponse } from '@/lib/apiService';
import type {
    LeaveConfigurationData,
    LeaveConfigurationGetResponse,
    LeaveConfigurationSaveRequest
} from '@/types/hrms/leave-management/leaveConfiguration/leaveConfiguration';

/**
 * Get Leave Configuration
 * GET /api/LeaveConfig/get_leave_configuartion
 *
 * @returns Leave configuration data
 */

export async function getLeaveConfiguration(): Promise<ApiResponse<LeaveConfigurationData>> {
    const url = '/api/LeaveConfig/get_leave_configuartion';
    console.log('🔵 [SERVER] GET Request URL:', url);

    try {
        // CHANGED: api.post -> api.get based on user request "GET /api/LeaveConfig/get_leave_configuartion"
        const response = await api.post<LeaveConfigurationGetResponse>('hmslms', url);
        console.log('🔵 [SERVER] GET Response:', JSON.stringify(response, null, 2));

        const res = response as any;
        // Check for success flag in the response structure provided by user
        const isSuccess = res.success === true || String(res.success) === 'true';

        if (isSuccess && res.data) {
            return {
                success: true,
                message: res.message || 'Leave configuration fetched successfully',
                data: res.data
            };
        }

        return {
            success: false,
            message: res.message || 'No configuration found',
            data: null
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error fetching leave configuration');
        console.error('🔴 [SERVER] Error details:', {
            message: error?.message,
            response: error?.response?.data,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            stack: error?.stack
        });
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch leave configuration';
        return {
            success: false,
            message: errorMessage,
            data: null
        };
    }
}

/**
 * Save Leave Configuration
 * POST /api/LeaveConfig/add_or_update_leave_configuration
 *
 * @param data - Leave configuration data to save
 * @returns Save response
 */
export async function saveLeaveConfiguration(data: LeaveConfigurationSaveRequest): Promise<ApiResponse<any>> {
    // CHANGED: URL updated to /api/LeaveConfig/add_or_update_leave_configuration
    const url = '/api/LeaveConfig/add_or_update_leave_configuration';

    // CHANGED: Request body mapped to PascalCase to match user provided example
    const requestBody = {
        HRLPC_Id: data.HRLPC_Id || 0,
        MI_Id: data.MI_Id || HRMS_MI_ID,
        HRLPC_SpOrGenFlg: data.HRLPC_SpOrGenFlg || "G", // Default to "G" if missing/null?
        HRLPC_PunchGAPTime: data.HRLPC_PunchGAPTime,
        HRLPC_AbsentFlag: data.HRLPC_AbsentFlag,
        HRLPC_LateInEarlyOutFlag: data.HRLPC_LateInEarlyOutFlag,
        HRLPC_LateInRelaxFlag: !!data.HRLPC_LateInRelaxFlag,
        HRLPC_LateInEarlyOut: data.HRLPC_LateInEarlyOut,
        HRLPC_LateInTime: data.HRLPC_LateInTime,
        HRLPC_EarlyOutRelaxFlag: !!data.HRLPC_EarlyOutRelaxFlag,
        HRLPC_EarlyOutTime: data.HRLPC_EarlyOutTime,
        HRLPC_CummulativeTimeFlag: !!data.HRLPC_CummulativeTimeFlag,
        HRLPC_CummulativeTime: Number(data.HRLPC_CummulativeTime),
        HRLPC_AfterCummulativeTime: data.HRLPC_AfterCummulativeTime,
        HRLPC_NoOfLatesFlag: !!data.HRLPC_NoOfLatesFlag,
        HRLPC_NoofMonthlyLateInExempted: Number(data.HRLPC_NoofMonthlyLateInExempted),
        HRLPC_NoOfLates: Number(data.HRLPC_NoOfLates),
        HRLPC_NoOfLatesCFFlag: !!data.HRLPC_NoOfLatesCFFlag,
        HRLPC_LeavePrefixSuffixFlag: !!data.HRLPC_LeavePrefixSuffixFlag,
        HRLPC_IncludeHolidayFlag: !!data.HRLPC_IncludeHolidayFlag,
        HRLPC_ActiveFlag: data.HRLPC_ActiveFlag !== undefined ? !!data.HRLPC_ActiveFlag : true,
        // Dates handled by backend or keep null if new
        HRLPC_CreeatedDate: data.HRLPC_CreeatedDate || null,
        HRLPC_UpdatedDate: data.HRLPC_UpdatedDate || null,
        HRLPC_CreatedBy: data.HRLPC_CreatedBy || 0,
        HRLPC_UpdatedBy: data.HRLPC_UpdatedBy || 0
    };

    console.log('🟠 [SERVER] POST Request URL:', url);
    console.log('🟠 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));

    try {
        const response = await api.post<any>('hmslms', url, requestBody);
        console.log('🟢 [SERVER] Response:', JSON.stringify(response, null, 2));

        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true';

        if (isSuccess) {
            return {
                success: true,
                message: res.message || 'Leave configuration saved successfully',
                data: res.data
            };
        }

        return {
            success: false,
            message: res.message || 'Failed to save leave configuration',
            data: null
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Save Error:', error);
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save leave configuration';
        return {
            success: false,
            message: errorMessage,
            data: null
        };
    }
}
