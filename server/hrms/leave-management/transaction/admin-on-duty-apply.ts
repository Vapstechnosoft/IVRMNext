'use server';
import { api, type ApiResponse, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    AdminOnDutyApplyApiData,
    EmployeeOnDutyDetailsResponse,
    OnDutyLeaveSaveRequest
} from '@/types/hrms/leave-management/admin-on-duty-apply';

/**
 * Get employee on duty leave apply list
 * GET /api/AdminOnDutyApply/get_employee_on_duty_leave_apply
 */
export async function getEmployeeOnDutyLeaveApply(
    searchParams?: ApiSearchparams
): Promise<ApiResponse<AdminOnDutyApplyApiData[]>> {
    const baseUrl = '/api/AdminOnDutyApply/get_employee_on_duty_leave_apply';
    const queryParams = getSearchParamsUrl(searchParams);
    const url = queryParams ? `${baseUrl}?${queryParams}` : baseUrl;

    console.log('🔵 [SERVER] GET Request URL:', url);
    try {
        const response = await api.get<any>('hmslms', url);
        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true';

        return {
            success: isSuccess,
            message: res.message || 'Leave list fetched successfully',
            data: res.data || [],
            total: res.total || 0,
            page: res.page || 1,
            page_size: res.page_size || res.page_Size || 10
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to fetch leave list');
    }
}

/**
 * Get employee on duty details by ID
 * GET /api/AdminOnDutyApply/employee_on_duty_details_by_id/{hrme_id}
 */
export async function getEmployeeOnDutyDetails(hrmeId: number): Promise<ApiResponse<EmployeeOnDutyDetailsResponse>> {
    const url = `/api/AdminOnDutyApply/employee_on_duty_details_by_id/${hrmeId}`;
    console.log('🔵 [SERVER] GET Request URL:', url);
    try {
        const response = await api.get<any>('hmslms', url);
        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true';

        return {
            success: isSuccess,
            message: res.message || 'Employee details fetched successfully',
            data: res.data || null
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to fetch employee details');
    }
}

/**
 * Save on duty leave request
 * POST /api/AdminOnDutyApply/on_duty_leave_request
 */
export async function saveOnDutyLeaveRequest(data: OnDutyLeaveSaveRequest): Promise<ApiResponse<any>> {
    const url = '/api/AdminOnDutyApply/on_duty_leave_request';
    console.log('🟠 [SERVER] POST Request URL:', url);
    try {
        const response = await api.post<any>('hmslms', url, data);
        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true';

        return {
            success: isSuccess,
            message: res.message || 'Leave application submitted successfully',
            data: res.data || null
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to submit leave application');
    }
}

/**
 * Get leave details by ID
 * GET /api/AdminOnDutyApply/get_leave_details_by_id/{hrelap_id}
 */
export async function getLeaveDetailsById(hrelapId: number): Promise<ApiResponse<any>> {
    const url = `/api/AdminOnDutyApply/get_leave_details_by_id/${hrelapId}`;
    console.log('🔵 [SERVER] GET Request URL:', url);
    try {
        const response = await api.get<any>('hmslms', url);
        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true';

        return {
            success: isSuccess,
            message: res.message || 'Leave details fetched successfully',
            data: res.data || null
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to fetch leave details');
    }
}

/**
 * Delete leave by ID
 * DELETE /api/AdminOnDutyApply/delete_leave_by_id/{hrelap_id}
 */
export async function deleteLeaveById(hrelapId: number): Promise<ApiResponse<any>> {
    const url = `/api/AdminOnDutyApply/delete_leave_by_id/${hrelapId}`;
    console.log('🔴 [SERVER] DELETE Request URL:', url);
    try {
        const response = await api.delete<any>('hmslms', url);
        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true';

        return {
            success: isSuccess,
            message: res.message || 'Leave deleted successfully',
            data: res.data || null
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to delete leave');
    }
}

/**
 * View on duty leave details by ID
 * GET /api/AdminOnDutyApply/view_on_duty_leave_details_by_id/{hrelap_id}
 */
export async function viewOnDutyLeaveDetailsById(hrelapId: number): Promise<ApiResponse<any>> {
    const url = `/api/AdminOnDutyApply/view_on_duty_leave_details_by_id/${hrelapId}`;
    console.log('🔵 [SERVER] GET Request URL:', url);
    try {
        const response = await api.get<any>('hmslms', url);
        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true';

        return {
            success: isSuccess,
            message: res.message || 'Leave details fetched successfully',
            data: res.data || []
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to fetch leave details');
    }
}
