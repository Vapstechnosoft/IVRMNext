'use server';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { type ApiResponse, api } from '@/lib/apiService';
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
        const response = await api.get<LeaveConfigurationGetResponse>('hmslms', url);
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

    // CHANGED: Request body mapped to hrlpC_ style to match user provided example and backend expectations
    const requestBody = {
        hrlpC_Id: data.hrlpC_Id || 0,
        mI_Id: data.mI_Id || HRMS_MI_ID,
        hrlpC_SpOrGenFlg: data.hrlpC_SpOrGenFlg || 'G',
        hrlpC_PunchGAPTime: data.hrlpC_PunchGAPTime,
        hrlpC_AbsentFlag: data.hrlpC_AbsentFlag,
        hrlpC_LateInEarlyOutFlag: data.hrlpC_LateInEarlyOutFlag,
        hrlpC_LateInRelaxFlag: !!data.hrlpC_LateInRelaxFlag,
        hrlpC_LateInEarlyOut: data.hrlpC_LateInEarlyOut,
        hrlpC_LateInTime: data.hrlpC_LateInTime,
        hrlpC_EarlyOutRelaxFlag: !!data.hrlpC_EarlyOutRelaxFlag,
        hrlpC_EarlyOutTime: data.hrlpC_EarlyOutTime,
        hrlpC_CummulativeTimeFlag: !!data.hrlpC_CummulativeTimeFlag,
        hrlpC_CummulativeTime: Number(data.hrlpC_CummulativeTime),
        hrlpC_AfterCummulativeTime: data.hrlpC_AfterCummulativeTime,
        hrlpC_NoOfLatesFlag: !!data.hrlpC_NoOfLatesFlag,
        hrlpC_NoofMonthlyLateInExempted: Number(data.hrlpC_NoofMonthlyLateInExempted),
        hrlpC_NoOfLates: Number(data.hrlpC_NoOfLates),
        hrlpC_NoOfLatesCFFlag: !!data.hrlpC_NoOfLatesCFFlag,
        hrlpC_LeavePrefixSuffixFlag: !!data.hrlpC_LeavePrefixSuffixFlag,
        hrlpC_IncludeHolidayFlag: !!data.hrlpC_IncludeHolidayFlag,
        hrlpC_ActiveFlag: data.hrlpC_ActiveFlag !== undefined ? !!data.hrlpC_ActiveFlag : true,
        hrlpC_CreeatedDate: data.hrlpC_CreeatedDate || null,
        hrlpC_UpdatedDate: data.hrlpC_UpdatedDate || null,
        hrlpC_CreatedBy: data.hrlpC_CreatedBy || 0,
        hrlpC_UpdatedBy: data.hrlpC_UpdatedBy || 0
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
