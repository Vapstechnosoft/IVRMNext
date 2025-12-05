'use server';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { api, type ApiResponse } from '@/lib/apiService';
import type {
    LeaveAuthorizationGetRequest,
    LeaveAuthorizationGetResponse,
    LeaveAuthorizationGetResponseData,
    LeaveAuthorizationSaveRequest,
    LeaveAuthorizationSaveResponse,
    LeaveAuthorizationEditRequest,
    LeaveAuthorizationEditResponse,
    LeaveAuthorizationDeleteRequest,
    LeaveAuthorizationDeleteResponse
} from '@/types/hrms/leave-management/leave-authorization';
/**
 * Get leave authorization details
 * POST /api/LeaveAuthorizationFacade/GetAuthLeave
 * 
 * @param request - Request payload with UserId, MI_Id, and onchangeoronload
 * @returns Leave authorization data
 */
export async function getLeaveAuthorization(request: LeaveAuthorizationGetRequest): Promise<ApiResponse<LeaveAuthorizationGetResponseData>> {
    const url = '/api/LeaveAuthorizationFacade/GetAuthLeave';
    const requestBody: LeaveAuthorizationGetRequest = {
        UserId: request.UserId || 0,
        MI_Id: request.MI_Id || HRMS_MI_ID,
        onchangeoronload: request.onchangeoronload || ''
    };
    console.log('🔵 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
        const response = await api.post<LeaveAuthorizationGetResponseData>('hmslms', url, requestBody);
        console.log('🔵 [SERVER] Response:', JSON.stringify(response, null, 2));
        // Handle the response structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped in ApiResponse format
            return response as ApiResponse<LeaveAuthorizationGetResponseData>;
        }
        // Wrap raw response data
        const responseData = response as any;
        return {
            success: responseData?.success ?? true,
            message: responseData?.message || responseData?.retrunMsg || 'Data fetched successfully',
            data: response as unknown as LeaveAuthorizationGetResponseData
        };
    } catch (error: any) {
        // Extract error message from API response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.retrunMsg || 
                           error?.message || 
                           'Failed to fetch leave authorization data';
        // Throw error so hooks can catch and display it
        throw new Error(errorMessage);
    }
}
/**
 * Save or update leave authorization
 * POST /api/LeaveAuthorizationFacade/SaveAuthData
 * 
 * @param data - Leave authorization data to save or update
 * @returns Save/Update response
 */
export async function saveLeaveAuthorization(data: LeaveAuthorizationSaveRequest): Promise<ApiResponse<LeaveAuthorizationGetResponseData>> {
    const url = '/api/LeaveAuthorizationFacade/SaveAuthData';
    const requestBody: LeaveAuthorizationSaveRequest = {
        MI_Id: data.MI_Id || HRMS_MI_ID,
        HRMG_Id: data.HRMG_Id || 0,
        HRMGT_Id: data.HRMGT_Id || 0,
        HRMD_Id: data.HRMD_Id || 0,
        HRMDES_Id: data.HRMDES_Id || 0,
        HRML_Id: data.HRML_Id || 0,
        UserId: data.UserId || 0,
        approvaluser_array: data.approvaluser_array || []
    };
    console.log('🟠 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
        const response = await api.post<LeaveAuthorizationSaveResponse>('hmslms', url, requestBody);
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
                message: retrunMsg || 'Leave authorization already exists',
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
                         (response?.success === true);
        let message = retrunMsg || 'Failed to save leave authorization';
        if (isSuccess) {
            message = retrunMsg || 'Leave authorization saved successfully';
        }
        return {
            success: isSuccess,
            message: message,
            data: responseData?.data || null
        };
    } catch (error: any) {
        // Extract error message from API response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.retrunMsg || 
                           error?.message || 
                           'Failed to save leave authorization';
        throw new Error(errorMessage);
    }
}
/**
 * Get leave authorization for editing
 * POST /api/LeaveAuthorizationFacade/EditDetails
 * 
 * @param HRLAON_Id - Leave authorization ID to edit
 * @returns Leave authorization data for editing
 */
export async function getLeaveAuthorizationForEdit(HRLAON_Id: number): Promise<ApiResponse<LeaveAuthorizationGetResponseData>> {
    const url = '/api/LeaveAuthorizationFacade/EditDetails';
    const requestBody: LeaveAuthorizationEditRequest = {
        HRLAON_Id: HRLAON_Id || 0
    };
    console.log('🔵 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
        const response = await api.post<LeaveAuthorizationGetResponseData>('hmslms', url, requestBody);
        console.log('🔵 [SERVER] Response:', JSON.stringify(response, null, 2));
        // Handle the response structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped in ApiResponse format
            return response as ApiResponse<LeaveAuthorizationGetResponseData>;
        }
        // Wrap raw response data
        const responseData = response as any;
        return {
            success: responseData?.success ?? true,
            message: responseData?.message || responseData?.retrunMsg || 'Data fetched successfully',
            data: response as unknown as LeaveAuthorizationGetResponseData
        };
    } catch (error: any) {
        // Extract error message from API response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.retrunMsg || 
                           error?.message || 
                           'Failed to fetch leave authorization data for editing';
        // Throw error so hooks can catch and display it
        throw new Error(errorMessage);
    }
}
/**
 * Delete leave authorization
 * POST /api/LeaveAuthorizationFacade/DeleteAuth
 * 
 * @param request - Delete request with HRLA_Id and HRLAON_Id
 * @returns Delete response
 */
export async function deleteLeaveAuthorization(request: LeaveAuthorizationDeleteRequest): Promise<ApiResponse<any>> {
    const url = '/api/LeaveAuthorizationFacade/DeleteAuth';
    const requestBody: LeaveAuthorizationDeleteRequest = {
        HRLA_Id: request.HRLA_Id || 0,
        HRLAON_Id: request.HRLAON_Id || 0
    };
    console.log('🔴 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
        const response = await api.post<LeaveAuthorizationDeleteResponse>('hmslms', url, requestBody);
        console.log('🔴 [SERVER] Response:', JSON.stringify(response, null, 2));
        // Handle the response structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped in ApiResponse format
            return response as ApiResponse<any>;
        }
        // Extract return message from response
        const responseData = response as any;
        const retrunMsg = responseData?.retrunMsg || 
                         responseData?.data?.retrunMsg || 
                         responseData?.message || 
                         '';
        // Check for success indicators
        const isSuccess = retrunMsg === 'Delete' || 
                         retrunMsg === 'Deleted' ||
                         retrunMsg === 'Success' ||
                         responseData?.returnval === true ||
                         (response as any)?.success === true;
        let message = retrunMsg || 'Failed to delete leave authorization';
        if (isSuccess) {
            message = retrunMsg || 'Leave authorization deleted successfully';
        }
        return {
            success: isSuccess,
            message: message,
            data: responseData?.data || null
        };
    } catch (error: any) {
        // Extract error message from API response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.retrunMsg || 
                           error?.message || 
                           'Failed to delete leave authorization';
        throw new Error(errorMessage);
    }
}
/**
 * Get leave authorization dropdown options
 * This calls GetAuthLeave with onchangeoronload="" to get dropdown data
 */
export async function getLeaveAuthorizationDropdowns(request: { MI_Id?: number; UserId?: number }): Promise<{
    grades: Array<{ value: string; label: string }>;
    groupTypes: Array<{ value: string; label: string }>;
    departments: Array<{ value: string; label: string }>;
    designations: Array<{ value: string; label: string }>;
    leaveTypes: Array<{ value: string; label: string }>;
    approvalPersons: Array<{ value: string; label: string }>;
}> {
    const response = await getLeaveAuthorization({
        UserId: request.UserId || 0,
        MI_Id: request.MI_Id || HRMS_MI_ID,
        onchangeoronload: ''
    });
    if (!response.success || !response.data) {
        return {
            grades: [],
            groupTypes: [],
            departments: [],
            designations: [],
            leaveTypes: [],
            approvalPersons: []
        };
    }
    const data = response.data as any;
    // Extract dropdown options from API response
    // These field names may need adjustment based on actual API response
    const grades = (data.gradedropdown || data.gradeList || []).map((item: any) => ({
        value: String(item.value || item.HRMG_Id || item.id || ''),
        label: String(item.label || item.HRMG_GradeName || item.name || '')
    })).filter((item: { value: string; label: string }) => item.value && item.label);
    const groupTypes = (data.groupTypedropdown || data.groupTypeList || []).map((item: any) => ({
        value: String(item.value || item.HRMGT_Id || item.id || ''),
        label: String(item.label || item.HRMGT_GroupTypeName || item.name || '')
    })).filter((item: { value: string; label: string }) => item.value && item.label);
    const departments = (data.departmentdropdown || data.departmentList || []).map((item: any) => ({
        value: String(item.value || item.HRMD_Id || item.id || ''),
        label: String(item.label || item.HRMD_DepartmentName || item.name || '')
    })).filter((item: { value: string; label: string }) => item.value && item.label);
    const designations = (data.designationdropdown || data.designationList || []).map((item: any) => ({
        value: String(item.value || item.HRMDES_Id || item.id || ''),
        label: String(item.label || item.HRMDES_DesignationName || item.name || '')
    })).filter((item: { value: string; label: string }) => item.value && item.label);
    const leaveTypes = (data.leaveTypedropdown || data.leaveTypeList || data.master_eventlist || []).map((item: any) => ({
        value: String(item.value || item.HRML_Id || item.LeaveType || item.id || ''),
        label: String(item.label || item.HRML_LeaveName || item.LeaveTypeName || item.name || '')
    })).filter((item: { value: string; label: string }) => item.value && item.label);
    const approvalPersons = (data.approvalPersondropdown || data.approvalPersonList || data.employeeList || []).map((item: any) => ({
        value: String(item.value || item.HRME_Id || item.EmployeeCode || item.id || ''),
        label: String(item.label || item.EmployeeName || item.HRME_EmployeeFirstName || item.name || '')
    })).filter((item: { value: string; label: string }) => item.value && item.label);
    return {
        grades,
        groupTypes,
        departments,
        designations,
        leaveTypes,
        approvalPersons
    };
}
